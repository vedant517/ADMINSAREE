import { useSelector } from 'react-redux';
import { useGetCartQuery } from '../features/cart/cartApi';
import { useGetWishlistQuery } from '../features/wishlist/wishlistApi';
import { useGetNotificationCountQuery } from '../features/notifications/notificationApi';

/**
 * Loads cart/wishlist/notification data only for the logged-in customer.
 * Skips API calls when no userId — prevents showing another user's cached counts.
 */
export const useCustomerSession = () => {
  const userId = useSelector((state) => state.auth.userId);
  const isCustomerLoggedIn = useSelector((state) => state.auth.isCustomerLoggedIn);
  const cartCount = useSelector((state) => state.ui.cartCount);
  const wishlistCount = useSelector((state) => state.ui.wishlistCount);
  const notificationCount = useSelector((state) => state.ui.notificationCount);

  const skip = !userId || !isCustomerLoggedIn;

  useGetCartQuery(undefined, { skip });
  useGetWishlistQuery(undefined, { skip });
  useGetNotificationCountQuery(undefined, { skip });

  return {
    userId,
    isCustomerLoggedIn,
    cartCount,
    wishlistCount,
    notificationCount,
  };
};
