import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../services/apiConfig";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // Automatically send cookies
    prepareHeaders: (headers) => {
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // Stats
    getCustomerStats: builder.query({
      query: () => "/admin/customers/stats",
    }),

    // Customer List
    getCustomers: builder.query({
      query: ({ page = 1, search = "" }) =>
        `/admin/customers?page=${page}&limit=5&search=${search}`,
    }),

    // Single Customer
    getCustomerById: builder.query({
      query: (id) => `/admin/customers/${id}`,
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
} = customerApi;
