import { baseApi } from "./baseApi";
import { TAG_TYPES } from "../enum/tag";
import { tagById, tagList } from "../enum/tagHelper";
import { STOCK_URL } from "../enum/url";

const stockMutationInvalidates = (itemId) => [
  ...tagList(TAG_TYPES.ITEMS),
  ...tagById(TAG_TYPES.ITEMS, itemId),
  ...tagById(TAG_TYPES.STOCK, itemId),
];

export const stockMovementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    stockIn: builder.mutation({
      query: (payload) => ({
        url: STOCK_URL.IN,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, payload) =>
        stockMutationInvalidates(payload?.itemId),
    }),
    stockOut: builder.mutation({
      query: (payload) => ({
        url: STOCK_URL.OUT,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, payload) =>
        stockMutationInvalidates(payload?.itemId),
    }),
    updateStock: builder.mutation({
      query: (payload) => ({
        url: STOCK_URL.UPDATE,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, payload) =>
        stockMutationInvalidates(payload?.itemId),
    }),
    stockHistory: builder.query({
      query: (itemId) =>
        itemId ? STOCK_URL.HISTORY(itemId) : STOCK_URL.HISTORY_ALL,
      transformResponse: (response) => response?.data || [],
      providesTags: (result, error, itemId) =>
        itemId ? tagById(TAG_TYPES.STOCK, itemId) : tagList(TAG_TYPES.STOCK),
    }),
  }),
});

export const {
  useStockInMutation,
  useStockOutMutation,
  useUpdateStockMutation,
  useStockHistoryQuery,
} = stockMovementApi;
