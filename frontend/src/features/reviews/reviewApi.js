import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({

    // POST /api/reviews
    createReview: builder.mutation({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
        // body: { user, product, rating, comment }
      }),
      invalidatesTags: ['Review'],
    }),

    // GET /api/reviews  (admin — all reviews)
    getAllReviews: builder.query({
      query: () => '/reviews',
      providesTags: ['Review'],
    }),

    // GET /api/reviews/product/:productId
    getProductReviews: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Review', id: productId }],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetAllReviewsQuery,
  useGetProductReviewsQuery,
} = reviewApi;
