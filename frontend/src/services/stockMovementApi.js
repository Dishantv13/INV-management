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
    adjustStock: builder.mutation({
      query: (payload) => ({
        url: STOCK_URL.ADJUST,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, payload) =>
        stockMutationInvalidates(payload?.itemId),
    }),
    stockHistory: builder.query({
      query: ({ itemId, page = 1, limit = 10, skip, search } = {}) => ({
        url: itemId ? STOCK_URL.HISTORY(itemId) : STOCK_URL.HISTORY_ALL,
        params: { page, limit, skip, search },
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
        pagination: response?.pagination || null,
      }),
      providesTags: (result, error, arg) =>
        arg?.itemId
          ? tagById(TAG_TYPES.STOCK, arg.itemId)
          : tagList(TAG_TYPES.STOCK),
    }),
  }),
});

export const {
  useStockHistoryQuery,
  useLazyStockHistoryQuery,
  useAdjustStockMutation
} = stockMovementApi;
