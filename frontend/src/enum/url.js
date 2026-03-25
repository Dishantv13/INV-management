export const ITEM_URL = {
  BASE: "/items",
  BY_ID: (id) => `/items/${id}`,
};

export const STOCK_URL = {
  IN: "/stock/in",
  OUT: "/stock/out",
  UPDATE: "/stock/update",
  HISTORY_ALL: "/stock/history",
  HISTORY: (itemId) => `/stock/history/${itemId}`,
};

export const ROUTE_URL = {
  DASHBOARD: "/",
  ITEMS: "/items",
  STOCK_ADJUSTMENT: "/stock-adjustment",
  STOCK_HISTORY: "/stock/history",
};
