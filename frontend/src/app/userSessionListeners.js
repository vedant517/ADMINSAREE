import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { logout, setCredentials } from '../features/auth/authSlice';
import { cartApi } from '../features/cart/cartApi';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import { notificationApi } from '../features/notifications/notificationApi';
import {
  setCartCount,
  setNotificationCount,
  setWishlistCount,
} from '../features/ui/uiSlice';
import { resetUserData } from '../utils/resetUserData';
import { getStoredUserId } from '../utils/userSession';

export const userSessionListener = createListenerMiddleware();

/** After login: drop stale cache, then load the new user's cart/wishlist/notifications. */
userSessionListener.startListening({
  matcher: isAnyOf(setCredentials),
  effect: async (action, { dispatch }) => {
    const userId = action.payload?.userId || action.payload?.user?.id;
    if (!userId || !action.payload?.isCustomer) return;

    dispatch(cartApi.util.resetApiState());
    dispatch(wishlistApi.util.resetApiState());
    dispatch(notificationApi.util.resetApiState());

    try {
      const cartResult = await dispatch(
        cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      dispatch(setCartCount(cartResult?.totalItems ?? cartResult?.cart?.length ?? 0));
    } catch {
      dispatch(setCartCount(0));
    }

    try {
      const wishlistResult = await dispatch(
        wishlistApi.endpoints.getWishlist.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      const list = wishlistResult?.wishlist ?? [];
      dispatch(setWishlistCount(Array.isArray(list) ? list.length : 0));
    } catch {
      dispatch(setWishlistCount(0));
    }

    try {
      const notifResult = await dispatch(
        notificationApi.endpoints.getNotificationCount.initiate(undefined, {
          forceRefetch: true,
        })
      ).unwrap();
      dispatch(setNotificationCount(notifResult?.count ?? 0));
    } catch {
      dispatch(setNotificationCount(0));
    }
  },
});

/** On logout: immediately zero navbar counts and wipe cached API data. */
userSessionListener.startListening({
  matcher: isAnyOf(logout),
  effect: async (_action, { dispatch }) => {
    resetUserData(dispatch);
  },
});

/** Keep UI counts in sync when cart/wishlist queries return (same logged-in user). */
userSessionListener.startListening({
  matcher: isAnyOf(cartApi.endpoints.getCart.matchFulfilled),
  effect: (action, { dispatch, getState }) => {
    const currentUserId = getStoredUserId();
    const authUserId = getState().auth?.userId;
    if (!currentUserId || !authUserId || String(currentUserId) !== String(authUserId)) {
      return;
    }
    const payload = action.payload;
    dispatch(setCartCount(payload?.totalItems ?? payload?.cart?.length ?? 0));
  },
});

userSessionListener.startListening({
  matcher: isAnyOf(wishlistApi.endpoints.getWishlist.matchFulfilled),
  effect: (action, { dispatch, getState }) => {
    const currentUserId = getStoredUserId();
    const authUserId = getState().auth?.userId;
    if (!currentUserId || !authUserId || String(currentUserId) !== String(authUserId)) {
      return;
    }
    const list = action.payload?.wishlist ?? [];
    dispatch(setWishlistCount(Array.isArray(list) ? list.length : 0));
  },
});

userSessionListener.startListening({
  matcher: isAnyOf(notificationApi.endpoints.getNotificationCount.matchFulfilled),
  effect: (action, { dispatch, getState }) => {
    const currentUserId = getStoredUserId();
    const authUserId = getState().auth?.userId;
    if (!currentUserId || !authUserId || String(currentUserId) !== String(authUserId)) {
      return;
    }
    dispatch(setNotificationCount(action.payload?.count ?? 0));
  },
});
