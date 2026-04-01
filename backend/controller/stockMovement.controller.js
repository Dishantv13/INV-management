import {
  addStockService,
  getAllStockHistoryServices,
  removeStockService,
  getStockHistoryServices,
} from "../services/stockMovement.services.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { STOCK_MOVEMENT } from "../utils/successMessage.js";

export const addStock = asyncHandler(async (req, res) => {
  const movementData = req.body;
  const stockMovement = await addStockService(movementData);
  successResponse(res, stockMovement, HTTP_STATUS.OK, STOCK_MOVEMENT.UPDATED);
});

export const removeStock = asyncHandler(async (req, res) => {
  const movementData = req.body;
  const stockMovement = await removeStockService(movementData);
  successResponse(res, stockMovement, HTTP_STATUS.OK, STOCK_MOVEMENT.UPDATED);
});

export const getStockHistory = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { data, pagination } = await getStockHistoryServices(itemId, req.query);
  successResponse(
    res,
    data,
    HTTP_STATUS.OK,
    STOCK_MOVEMENT.HISTORY_RETRIEVED,
    pagination,
  );
});

export const getAllStockHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await getAllStockHistoryServices(req.query);
  successResponse(
    res,
    data,
    HTTP_STATUS.OK,
    STOCK_MOVEMENT.HISTORY_RETRIEVED,
    pagination,
  );
});

