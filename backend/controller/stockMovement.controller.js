import {
  adjustStockService,
  getAllStockHistoryServices,
  getStockHistoryServices,
} from "../services/stockMovement.services.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { STOCK_MOVEMENT } from "../utils/successMessage.js";


export const adjustStock = asyncHandler(async (req, res) => {
  const movementData = req.body;

  const stockMovement = await adjustStockService(movementData);

  successResponse(
    res,
    stockMovement,
    HTTP_STATUS.OK,
    "Stock adjusted successfully",
  );
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

