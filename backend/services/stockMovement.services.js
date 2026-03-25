import { StockMovement } from "../models/stockMovement.model.js";
import { Item } from "../models/item.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";

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
      if (!item) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
      }

      if (type === "OUT") {
        if (item.currentStock < quantity) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Insufficient stock for this movement",
          );
        }
        item.currentStock -= quantity;
      } else if (type === "IN") {
        item.currentStock += quantity;
      } else {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid movement type");
      }

      await item.save({ session });
      stockMovement = await StockMovement.create(
        [
          {
            itemId,
            quantity,
            type,
            reference: reference || "manual",
            note,
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

export const getStockHistoryServices = async (itemId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid itemId");
  }

  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }
  const history = await StockMovement.find({ itemId })
  .populate("itemId", "name sku")
  .sort({ createdAt: -1 });
  return history;
};

export const getAllStockHistoryServices = async () => {
  const history = await StockMovement.find()
    .populate("itemId", "name sku")
    .sort({ createdAt: -1 });

  return history;
};
