import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/apiConfig';

export const enquiryApi = createApi({
  reducerPath: 'enquiryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  endpoints: (builder) => ({

    // POST /api/enquiries  — submit contact us / enquiry form
    submitEnquiry: builder.mutation({
      query: (body) => ({
        url: '/enquiries',
        method: 'POST',
        body,
        // body: { name, contactNo, email, message }
      }),
    }),
  }),
});

export const {
  useSubmitEnquiryMutation,
} = enquiryApi;
