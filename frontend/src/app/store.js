import { configureStore } from '@reduxjs/toolkit';
import productsReducer   from '../features/products/productSlice';
import categoryReducer   from '../features/products/categorySlice';
import authReducer       from '../features/auth/authSlice';

// ── Existing API slices ──
import { orderApi }       from '../features/orders/orderApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { customerApi }    from '../features/customers/customerApi';
import { couponApi }      from '../features/coupons/couponApi';
import { authApi }        from '../features/auth/authApi';

// ── New API slices ──
import { cartApi }     from '../features/cart/cartApi';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import { reviewApi }   from '../features/reviews/reviewApi';
import { addressApi }  from '../features/addresses/addressApi';
import { enquiryApi }  from '../features/enquiries/enquiryApi';

export const store = configureStore({
  reducer: {
    // State slices
    auth:       authReducer,
    products:   productsReducer,
    categories: categoryReducer,

    // RTK Query reducers
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(orderApi.middleware)
      .concat(transactionApi.middleware)
      .concat(customerApi.middleware)
      .concat(couponApi.middleware)
      .concat(authApi.middleware)
      .concat(cartApi.middleware)
      .concat(wishlistApi.middleware)
      .concat(reviewApi.middleware)
      .concat(addressApi.middleware)
      .concat(enquiryApi.middleware),
});
