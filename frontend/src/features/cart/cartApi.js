import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from '../../services/authBaseQuery';
import { getStoredUserId } from '../../utils/userSession';
import { setCartCount } from '../ui/uiSlice';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: createAuthBaseQuery(),
  tagTypes: ['Cart'],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({

    // GET /api/cart — cache key includes userId so User B never sees User A cache
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
      serializeQueryArgs: ({ endpointName }) =>
        `${endpointName}-${getStoredUserId() || 'guest'}`,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCartCount(data?.totalItems ?? data?.cart?.length ?? 0));
        } catch {
          dispatch(setCartCount(0));
        }
      },
    }),

    addToCart: builder.mutation({
      query: (body) => ({
        url: '/cart/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/cart/update/${id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `/cart/remove/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
