import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Try to get token from Redux state first, fallback to localStorage
      const token = getState().auth?.token || localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (token) {
        // Use capitalized Authorization header for wider compatibility
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'OrderStats'],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (status) => (status ? `/admin/orders?status=${status}` : '/admin/orders'),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ orderId }) => ({ type: 'Order', id: orderId })),
            { type: 'Order', id: 'LIST' },
          ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrderStats: builder.query({
      query: () => '/admin/orders/stats',
      providesTags: ['OrderStats'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/admin/orders/${orderId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
        'OrderStats',
      ],
    }),
    updateShippingInfo: builder.mutation({
      query: ({ orderId, ...shippingData }) => ({
        url: `/orders/${orderId}/shipping`,
        method: 'PUT',
        body: shippingData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
        'OrderStats',
      ],
    }),
    calculateShippingCharge: builder.mutation({
      query: (amount) => ({
        url: '/shipping/calculate',
        method: 'POST',
        body: { amount },
      }),
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/user/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'OrderStats'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
  useCreateOrderMutation,
  useUpdateShippingInfoMutation,
  useCalculateShippingChargeMutation,
} = orderApi;
