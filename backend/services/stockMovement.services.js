import { StockMovement } from "../models/stockMovement.model.js";
import { Item } from "../models/item.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const validateCommonMovementData = ({ itemId, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid itemId");
  }

  if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Quantity must be greater than zero",
    );
  }
};

const runStockMovementTransaction = async (movementData) => {
  const { itemId, quantity, type, reference, note } = movementData;
  validateCommonMovementData({ itemId, quantity });

  const session = await mongoose.startSession();

  let stockMovement;
  try {
    await session.withTransaction(async () => {
      const item = await Item.findById(itemId).session(session);
      const previousStock = item.currentStock;
      let movementQty = 0;
      if (!item) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
      }

      if (type === "OUT") {
        if (item.currentStock <= quantity) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Quantity cannot be greater than or equal to current stock for OUT movement",
          );
        }
        movementQty = previousStock - quantity;
        item.currentStock = quantity;
      } else if (type === "IN") {
        if (quantity <= item.currentStock) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Quantity cannot be less than or equal to current stock for IN movement",
          );
        }
        movementQty = quantity - previousStock;
        item.currentStock = quantity;
      } else {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid movement type");
      }

      await item.save({ session });
      stockMovement = await StockMovement.create(
        [
          {
            itemId,
            quantity: movementQty,
            type,
            reference: reference || "manual",
            note: note || `Stock changed from ${previousStock} to ${quantity}`,
            currentStock: quantity,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return stockMovement[0];
};

export const addStockService = async (movementData) =>
  runStockMovementTransaction({ ...movementData, type: "IN" });

export const removeStockService = async (movementData) =>
  runStockMovementTransaction({ ...movementData, type: "OUT" });

export const updateStockService = async (movementData) => {
  const { type } = movementData;
  if (type === "IN") {
    return addStockService(movementData);
  }

  if (type === "OUT") {
    return removeStockService(movementData);
  }

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid movement type");
};

const getPaginatedHistory = async (filter = {}, query = {}) => {
  const usePagination =
    query.page !== undefined ||
    query.limit !== undefined ||
    query.skip !== undefined;

  if (!usePagination) {
    const history = await StockMovement.find(filter)
      .populate("itemId", "name sku")
      .sort({ createdAt: -1 });

    return { data: history, pagination: null };
  }

  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  const totalItems = await StockMovement.countDocuments(filter);
  const history = await StockMovement.find(filter)
    .populate("itemId", "name sku")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: history,
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const getStockHistoryServices = async (itemId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid itemId");
  }

  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }

  return getPaginatedHistory({ itemId }, query);
};

export const getAllStockHistoryServices = async (query = {}) => {
  return getPaginatedHistory({}, query);
};
