export const ITEM_URL = {
  BASE: "/items",
  BY_ID: (id) => `/items/${id}`,
  DASHBOARD_STATS: "/items/dashboard-stats",
};

export const STOCK_URL = {
  IN: "/stock/in",
  OUT: "/stock/out",
  HISTORY_ALL: "/stock/history",
  HISTORY: (itemId) => `/stock/history/${itemId}`,
};

export const LOCATION_URL = {
  BASE: "/locations",
  BY_ID: (id) => `/locations/${id}`,
  UPDATE_STATUS: (id) => `/locations/${id}/status`,
};

export const ROUTE_URL = {
  DASHBOARD: "/",
  ITEMS: "/items",
  STOCK_ADJUSTMENT: "/stock-adjustment",
  STOCK_HISTORY: "/stock/history",
  LOCATIONS: "/locations",
};
