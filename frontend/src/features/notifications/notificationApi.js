import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from '../../services/authBaseQuery';
import { getStoredUserId } from '../../utils/userSession';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: createAuthBaseQuery(),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotificationCount: builder.query({
      query: () => '/user/notifications/count',
      providesTags: ['Notifications'],
      serializeQueryArgs: ({ endpointName }) =>
        `${endpointName}-${getStoredUserId() || 'guest'}`,
    }),
  }),
});

export const { useGetNotificationCountQuery } = notificationApi;
