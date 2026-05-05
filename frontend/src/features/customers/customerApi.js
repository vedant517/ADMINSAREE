import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../services/apiConfig";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/customers`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // Stats
    getCustomerStats: builder.query({
      query: () => "/stats",
    }),

    // Customer List
    getCustomers: builder.query({
      query: ({ page = 1, search = "" }) =>
        `?page=${page}&limit=5&search=${search}`,
    }),

    // Single Customer
    getCustomerById: builder.query({
      query: (id) => `/${id}`,
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
} = customerApi;
