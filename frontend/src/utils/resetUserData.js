import { cartApi } from '../features/cart/cartApi';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import { notificationApi } from '../features/notifications/notificationApi';
import { resetUiCounts } from '../features/ui/uiSlice';
import { clearUserSessionStorage } from './userSession';

/**
 * Clears all in-memory and persisted customer cart/wishlist/notification state.
 * Call on logout and before switching to another logged-in user.
 */
export const resetUserData = (dispatch) => {
  clearUserSessionStorage();
  dispatch(resetUiCounts());
  dispatch(cartApi.util.resetApiState());
  dispatch(wishlistApi.util.resetApiState());
  dispatch(notificationApi.util.resetApiState());
};
