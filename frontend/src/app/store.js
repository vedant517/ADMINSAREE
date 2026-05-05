import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import categoryReducer from '../features/products/categorySlice';
import authReducer from '../features/auth/authSlice';
import { orderApi } from '../features/orders/orderApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { customerApi } from '../features/customers/customerApi';
import { couponApi } from '../features/coupons/couponApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoryReducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(orderApi.middleware)
      .concat(transactionApi.middleware)
      .concat(customerApi.middleware)
      .concat(couponApi.middleware),
});
