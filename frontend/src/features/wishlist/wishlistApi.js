import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // sends cookie token automatically
  }),
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({

    // GET /api/wishlist
    getWishlist: builder.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    // POST /api/wishlist/add
    addToWishlist: builder.mutation({
      query: (body) => ({
        url: '/wishlist/add',
        method: 'POST',
        body,
        // body: { productId, name, price, image, rating, description }
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // DELETE /api/wishlist/remove/:productId
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/remove/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // DELETE /api/wishlist/clear
    clearWishlist: builder.mutation({
      query: () => ({
        url: '/wishlist/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = wishlistApi;
