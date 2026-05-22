import { configureStore } from '@reduxjs/toolkit';
import productsReducer   from '../features/products/productSlice';
import categoryReducer   from '../features/products/categorySlice';
import authReducer       from '../features/auth/authSlice';
import uiReducer         from '../features/ui/uiSlice';

import { orderApi }       from '../features/orders/orderApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { customerApi }    from '../features/customers/customerApi';
import { couponApi }      from '../features/coupons/couponApi';
import { authApi }        from '../features/auth/authApi';

import { cartApi }     from '../features/cart/cartApi';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import { reviewApi }   from '../features/reviews/reviewApi';
import { addressApi }  from '../features/addresses/addressApi';
import { enquiryApi }  from '../features/enquiries/enquiryApi';
import { notificationApi } from '../features/notifications/notificationApi';
import { userSessionListener } from './userSessionListeners';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    products:   productsReducer,
    categories: categoryReducer,
    ui:         uiReducer,

    [orderApi.reducerPath]:       orderApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [customerApi.reducerPath]:    customerApi.reducer,
    [couponApi.reducerPath]:      couponApi.reducer,
    [authApi.reducerPath]:        authApi.reducer,
    [cartApi.reducerPath]:        cartApi.reducer,
    [wishlistApi.reducerPath]:    wishlistApi.reducer,
    [reviewApi.reducerPath]:      reviewApi.reducer,
    [addressApi.reducerPath]:     addressApi.reducer,
    [enquiryApi.reducerPath]:     enquiryApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userSessionListener.middleware)
      .concat(orderApi.middleware)
      .concat(transactionApi.middleware)
      .concat(customerApi.middleware)
      .concat(couponApi.middleware)
      .concat(authApi.middleware)
      .concat(cartApi.middleware)
      .concat(wishlistApi.middleware)
      .concat(reviewApi.middleware)
      .concat(addressApi.middleware)
      .concat(enquiryApi.middleware)
      .concat(notificationApi.middleware),
});
