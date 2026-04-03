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
  const { itemId, locationId, quantity, reference, note } = movementData;

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

      let inventoryEntry = item.inventory.find(
        (inv) => String(inv.locationId) === String(locationId),
      );

      if (!inventoryEntry) {
        inventoryEntry = { locationId, currentStock: 0 };
        item.inventory.push(inventoryEntry);
        inventoryEntry = item.inventory[item.inventory.length - 1];
      }

      const previousStock = inventoryEntry.currentStock;

      if (quantity === previousStock) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "New quantity must be different from current stock",
        );
      }

      let movementQty;
      let movementType;

      if (quantity > previousStock) {
        movementQty = quantity - previousStock;
        movementType = "IN";
      } else {
        movementQty = previousStock - quantity;
        movementType = "OUT";
      }


      inventoryEntry.currentStock = quantity;
      item.currentStock += quantity - previousStock;

      await item.save({ session });

      const existingMovementsCount = await StockMovement.countDocuments({
        itemId,
      }).session(session);

      stockMovement = await StockMovement.create(
        [
          {
            itemId,
            locationId,
            quantity: movementQty,
            type: movementType,
            reference: reference || "manual",
            note:
              note ||
              `Auto adjusted from ${previousStock} to ${quantity}`,
            currentStock: quantity,
            movementSequence: existingMovementsCount + 1,
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

export const adjustStockService = async (movementData) =>
  runStockMovementTransaction(movementData);

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

  const { data, pagination } = await getPaginatedHistory({ itemId }, query);

  return {
    data: data.map((movement) => ({
      ...movement.toObject(),
      movementDisplayId: `HIS-${movement.movementSequence}`,
    })),
    pagination,
  };
};

export const getAllStockHistoryServices = async (query = {}) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    const matchLocation = await Location.find({
      $or: [{ name: searchRegex }, { locationNo: searchRegex }],
    }).select("_id");
    const locationIds = matchLocation.map((loc) => loc._id);

    const matchItem = await Item.find({
      $or: [{ name: searchRegex }, { sku: searchRegex }],
    }).select("_id");
    const itemIds = matchItem.map((item) => item._id);

    filter.$or = [
      { locationId: { $in: locationIds } },
      { itemId: { $in: itemIds } },
      { reference: searchRegex },
      { type: searchRegex },
      { note: searchRegex },
    ];
  }
  return getPaginatedHistory(filter, query);
};
