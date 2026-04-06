import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TAG_TYPES } from "../enum/tag";

const baseUrl = import.meta.env.VITE_API_URL

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: Object.values(TAG_TYPES),
  endpoints: () => ({}),
});
