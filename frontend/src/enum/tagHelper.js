import { TAG_IDS } from "./tag";

export const tagList = (type) => [{ type, id: TAG_IDS.LIST }];

export const tagById = (type, id) => [{ type, id }];

export const tagListWithIds = (type, data = []) => [
  ...data.map(({ _id }) => ({ type, id: _id })),
  { type, id: TAG_IDS.LIST },
];
