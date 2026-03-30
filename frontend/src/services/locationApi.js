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
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: LOCATION_URL.BASE,
        params: { page, limit },
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
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationStatusMutation,
  useDeleteLocationMutation,
} = locationApi;
