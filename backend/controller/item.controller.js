import {
  createItemService,
  getAllItemsService,
  getItemByIdService,
  getDashboardStatsService,
  getDashboardLowStockService,
  getItemLocationServices,
  updateItemService,
  deleteItemService,
} from "../services/item.services.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { ITEM } from "../utils/successMessage.js";

export const createItem = asyncHandler(async (req, res) => {
  const itemData = req.body;
  const newItem = await createItemService(itemData);
  successResponse(res, newItem, HTTP_STATUS.CREATED, ITEM.CREATED);
});

export const getAllItems = asyncHandler(async (req, res) => {
  const { data, pagination } = await getAllItemsService(req.query);
  successResponse(res, data, HTTP_STATUS.OK, ITEM.RETRIEVED, pagination);
});

export const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await getItemByIdService(id);
  successResponse(res, item, HTTP_STATUS.OK, ITEM.RETRIEVED);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsService();
  successResponse(res, stats, HTTP_STATUS.OK, ITEM.DASHBOARD_STATS_RETRIEVED);
});

export const getDashboardLowStock = asyncHandler(async (req, res) => {
  const { data, pagination } = await getDashboardLowStockService(req.query);
  successResponse(res, data, HTTP_STATUS.OK, ITEM.DASHBOARD_LOW_STOCK_RETRIEVED, pagination);
});

export const getItemLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, pagination } = await getItemLocationServices(id, req.query);
  successResponse(res, data, HTTP_STATUS.OK, ITEM.RETRIEVED, pagination);
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedItem = await updateItemService(id, updateData);
  successResponse(res, updatedItem, HTTP_STATUS.OK, ITEM.UPDATED);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedItem = await deleteItemService(id);
  successResponse(res, deletedItem, HTTP_STATUS.OK, ITEM.DELETED);
});