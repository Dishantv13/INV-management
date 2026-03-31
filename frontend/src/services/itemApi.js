import { baseApi } from "./baseApi";
import { TAG_TYPES } from "../enum/tag";
import { tagList, tagListWithIds } from "../enum/tagHelper";
import { ITEM_URL } from "../enum/url";

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: ({ page = 1, limit = 1000 } = {}) => ({
        url: ITEM_URL.BASE,
        params: { page, limit },
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: (result) => tagListWithIds(TAG_TYPES.ITEMS, result || []),
    }),
    getItemsPaginated: builder.query({
      query: ({
        page = 1,
        limit = 5,
        skip,
        search,
        lowStockOnly = false,
      } = {}) => ({
        url: ITEM_URL.BASE,
        params: { page, limit, skip, search, lowStockOnly },
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
        pagination: response?.pagination || null,
      }),
      providesTags: (result) =>
        tagListWithIds(TAG_TYPES.ITEMS, result?.data || []),
    }),
    createItem: builder.mutation({
      query: (payload) => ({
        url: ITEM_URL.BASE,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: tagList(TAG_TYPES.ITEMS),
    }),
    getDashboardStats: builder.query({
      query: () => ({
        url: ITEM_URL.DASHBOARD_STATS,
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result) =>
        tagListWithIds(TAG_TYPES.ITEMS, result ? [result] : []),
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemsPaginatedQuery,
  useCreateItemMutation,
  useGetDashboardStatsQuery,
} = itemApi;
