import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Transaction', 'TransactionStats'],
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ status, page = 1, limit = 20 } = {}) => {
        let url = '/transactions?';
        if (status) url += `status=${status}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Transaction', id: _id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    getTransactionStats: builder.query({
      query: () => '/transactions/stats',
      providesTags: ['TransactionStats'],
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),
    refundTransaction: builder.mutation({
      query: ({ id, amount, reason }) => ({
        url: `/transactions/${id}/refund`,
        method: 'POST',
        body: { amount, reason },
      }),
      invalidatesTags: ['Transaction', 'TransactionStats'],
    }),
    // Payment endpoints
    createPaymentOrder: builder.mutation({
      query: (data) => ({
        url: '/payments/create-order',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transaction', 'TransactionStats'],
    }),
    getRazorpayKey: builder.query({
      query: () => '/payments/key',
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
  useGetTransactionByIdQuery,
  useRefundTransactionMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetRazorpayKeyQuery,
} = transactionApi;
