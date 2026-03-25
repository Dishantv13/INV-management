import { baseApi } from "./baseApi";
import { TAG_TYPES } from "../enum/tag";
import { tagList, tagListWithIds } from "../enum/tagHelper";
import { ITEM_URL } from "../enum/url";

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => ITEM_URL.BASE,
      transformResponse: (response) => response?.data || [],
      providesTags: (result = []) => tagListWithIds(TAG_TYPES.ITEMS, result),
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
  }),
});

export const { useGetItemsQuery, useCreateItemMutation } = itemApi;
