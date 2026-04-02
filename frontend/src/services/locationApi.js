import { baseApi } from "./baseApi";
import { TAG_TYPES } from "../enum/tag";
import { LOCATION_URL } from "../enum/url";
import { tagList, tagById } from "../enum/tagHelper";

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLocation: builder.mutation({
      query: (payload) => ({
        url: LOCATION_URL.BASE,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: tagList(TAG_TYPES.LOCATIONS),
    }),
    getLocations: builder.query({
      query: ({ page = 1, limit = 10, search, status } = {}) => ({
        url: LOCATION_URL.BASE,
        params: { page, limit, search, status },
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
        pagination: response?.pagination || null,
      }),
      providesTags: (result) => tagList(TAG_TYPES.LOCATIONS),
    }),
    getActiveLocations: builder.query({
      query: ({ page = 1, limit = 1000, search } = {}) => ({
        url: LOCATION_URL.BASE,
        params: { page, limit, search, status: "active" },
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
        pagination: response?.pagination || null,
      }),
      providesTags: (result) => tagList(TAG_TYPES.LOCATIONS),
    }),
    getLocationById: builder.query({
      query: (locationId) => ({
        url: LOCATION_URL.BY_ID(locationId),
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result, error, locationId) =>
        tagById(TAG_TYPES.LOCATIONS, locationId),
    }),
    updateLocationStatus: builder.mutation({
      query: ({ locationId, status }) => ({
        url: LOCATION_URL.UPDATE_STATUS(locationId),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { locationId }) => [
        ...tagList(TAG_TYPES.LOCATIONS),
        ...tagById(TAG_TYPES.LOCATIONS, locationId),
      ],
    }),
    deleteLocation: builder.mutation({
      query: (locationId) => ({
        url: LOCATION_URL.BY_ID(locationId),
        method: "DELETE",
      }),
      invalidatesTags: tagList(TAG_TYPES.LOCATIONS),
    }),
    getItemsByLocation: builder.query({
      query: ({ locationId, page = 1, limit = 10 } = {}) => ({
        url: LOCATION_URL.ITEMS(locationId),
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
        pagination: response?.pagination || null,
      }),
      providesTags: (result, error, arg) => [
        ...tagById(TAG_TYPES.LOCATIONS, arg?.locationId),
        ...tagList(TAG_TYPES.ITEMS),
      ],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetActiveLocationsQuery,
  useGetLocationByIdQuery,
  useGetItemsByLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationStatusMutation,
  useDeleteLocationMutation,
} = locationApi;
