import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from '../../services/authBaseQuery';
import { getStoredUserId } from '../../utils/userSession';
import { setWishlistCount } from '../ui/uiSlice';

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: createAuthBaseQuery(),
  tagTypes: ['Wishlist'],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({

    getWishlist: builder.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
      serializeQueryArgs: ({ endpointName }) =>
        `${endpointName}-${getStoredUserId() || 'guest'}`,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const list = data?.wishlist ?? [];
          dispatch(setWishlistCount(Array.isArray(list) ? list.length : 0));
        } catch {
          dispatch(setWishlistCount(0));
        }
      },
    }),

    addToWishlist: builder.mutation({
      query: (body) => ({
        url: '/wishlist/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/remove/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

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
