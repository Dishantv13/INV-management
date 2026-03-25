import {
  addStockService,
  getAllStockHistoryServices,
  removeStockService,
  updateStockService,
  getStockHistoryServices,
} from "../services/stockMovement.services.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { STOCK_MOVEMENT } from "../utils/successMessage.js";

export const updateStock = asyncHandler(async (req, res) => {
  const movementData = req.body;
  const stockMovement = await updateStockService(movementData);
  successResponse(
    res,
    stockMovement,
    HTTP_STATUS.OK,
    STOCK_MOVEMENT.UPDATED
  );
});

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
  const history = await getStockHistoryServices(itemId);
  successResponse(
    res,
    history,
    HTTP_STATUS.OK,
    STOCK_MOVEMENT.HISTORY_RETRIEVED
  );
});

export const getAllStockHistory = asyncHandler(async (req, res) => {
  const history = await getAllStockHistoryServices();
  successResponse(
    res,
    history,
    HTTP_STATUS.OK,
    STOCK_MOVEMENT.HISTORY_RETRIEVED,
  );
});
