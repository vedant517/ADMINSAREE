import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // sends cookie token automatically
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({

    // GET /api/cart
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    // POST /api/cart/add
    addToCart: builder.mutation({
      query: (body) => ({
        url: '/cart/add',
        method: 'POST',
        body,
        // body: { productId, name, price, image, quantity, selectedVariant }
      }),
      invalidatesTags: ['Cart'],
    }),

    // PUT /api/cart/update/:id
    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/cart/update/${id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    // DELETE /api/cart/remove/:id
    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `/cart/remove/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // DELETE /api/cart/clear
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
