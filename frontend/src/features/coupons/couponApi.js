import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({

    /* ── Admin endpoints ── */
    getCoupons: builder.query({
      query: ({ page = 1, limit = 10, search = '', isActive, discountType } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search)       params.set('search', search);
        if (isActive !== undefined) params.set('isActive', isActive);
        if (discountType) params.set('discountType', discountType);
        return `/coupons?${params.toString()}`;
      },
      providesTags: ['Coupon'],
    }),

    getCouponById: builder.query({
      query: (id) => `/coupons/${id}`,
      providesTags: (_, __, id) => [{ type: 'Coupon', id }],
    }),

    createCoupon: builder.mutation({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),

    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Coupon'],
    }),

    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupon'],
    }),

    toggleCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Coupon'],
    }),

    /* ── User/checkout endpoints ── */
    applyCoupon: builder.mutation({
      query: (body) => ({ url: '/coupons/apply', method: 'POST', body }),
    }),

    markCouponUsed: builder.mutation({
      query: (body) => ({ url: '/coupons/mark-used', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponMutation,
  useApplyCouponMutation,
  useMarkCouponUsedMutation,
} = couponApi;