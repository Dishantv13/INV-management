import { StockMovement } from "../models/stockMovement.model.js";
import { Item } from "../models/item.model.js";
import { Location } from "../models/location.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const validateCommonMovementData = ({ itemId, locationId, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid itemId");
  }

  if (!mongoose.Types.ObjectId.isValid(locationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid locationId");
  }

  if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Quantity must be greater than zero",
    );
  }
};

const runStockMovementTransaction = async (movementData) => {
  const { itemId, locationId, quantity, type, reference, note } = movementData;
  validateCommonMovementData({ itemId, locationId, quantity });

  const session = await mongoose.startSession();

  let stockMovement;
  try {
    await session.withTransaction(async () => {
      const item = await Item.findById(itemId).session(session);
      if (!item) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
      }

      const location = await Location.findById(locationId).session(session);
      if (!location || location.status !== "active") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Location is not active");
      }

      const latestLocationMovement = await StockMovement.findOne({
        itemId,
        locationId,
      })
        .sort({ createdAt: -1 })
        .session(session);

      const previousStock = latestLocationMovement?.currentStock || 0;
      let movementQty = 0;
      let nextStock = previousStock;

      if (type === "OUT") {
        if (quantity >= previousStock) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Quantity cannot be greater than or equal to current location stock for OUT movement",
          );
        }
        movementQty = previousStock - quantity;
        nextStock = quantity;
      } else if (type === "IN") {
        if (quantity <= previousStock) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Quantity cannot be less than or equal to current location stock for IN movement",
          );
        }
        movementQty = quantity - previousStock;
        nextStock = quantity;
      } else {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid movement type");
      }

      item.currentStock = item.currentStock + (nextStock - previousStock);

      await item.save({ session });
      stockMovement = await StockMovement.create(
        [
          {
            itemId,
            locationId,
            quantity: movementQty,
            type,
            reference: reference || "manual",
            note: note || `Stock changed from ${previousStock} to ${quantity}`,
            currentStock: nextStock,
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

const getPaginatedHistory = async (filter = {}, query = {}) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  const totalItems = await StockMovement.countDocuments(filter);
  const history = await StockMovement.find(filter)
    .populate("itemId", "name sku")
    .populate("locationId", "name locationNo")
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

