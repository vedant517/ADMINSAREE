import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const addressApi = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // sends cookie token (protect middleware)
  }),
  tagTypes: ['Address'],
  endpoints: (builder) => ({

    // GET /api/addresses  — get user's saved addresses
    getAddresses: builder.query({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),

    // POST /api/addresses  — save a new address
    addAddress: builder.mutation({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
        // body: { firstName, lastName, email, phoneNumber, address, country, state, city, zipCode }
      }),
      invalidatesTags: ['Address'],
    }),

    // PUT /api/addresses/:id  — update an existing address
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Address'],
    }),

    // DELETE /api/addresses/:id  — delete an address
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
