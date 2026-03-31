import mongoose from "mongoose";
import { Item } from "../models/item.model.js";
import { Location } from "../models/location.model.js";
import { StockMovement } from "../models/stockMovement.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const createItemService = async (itemData) => {
  const { name, sku, price, currentStock, lowStockThreshold, location } =
    itemData;

  const locationExists = await Location.findById(location);
  if (!locationExists || !mongoose.Types.ObjectId.isValid(location)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid location ID");
  }
  if (locationExists.status !== "active") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Location is not active");
  }

  if (!name || !sku) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Name and SKU are required");
  }

  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Price must be greater than zero",
    );
  }

  const normalizedSku = sku.trim().toUpperCase();
  const item = await Item.findOne({ sku: normalizedSku, location: location });
  if (item) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Item with this SKU already exists",
    );
  }

  const newItem = await Item.create({
    name: name.trim(),
    sku: normalizedSku,
    price,
    currentStock: currentStock || 0,
    lowStockThreshold,
    location,
  });

  if ((currentStock || 0) > 0) {
    await StockMovement.create({
      itemId: newItem._id,
      locationId: location,
      quantity: currentStock,
      type: "IN",
      reference: "manual",
      note: "Initial stock on item creation",
      currentStock,
    });
  }

  return newItem;
};

export const getAllItemsService = async (query = {}) => {
  const filter = {};

  if (query.lowStockOnly === "true") {
    filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }

  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });
  const totalItems = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .populate("location", "name locationNo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: items.map((item) => ({
      ...item.toObject(),
      isLowStock: item.currentStock <= item.lowStockThreshold,
    })),
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const getItemByIdService = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }
  return item;
};

export const getDashboardStatsService = async () => {
  const items = await Item.find({});
  const totalItems = items.length;
  const lowStockItems = items.filter(
    (item) => item.currentStock <= item.lowStockThreshold,
  ).length;
  const totalStockValue = items.reduce(
    (acc, item) => acc + item.price * item.currentStock,
    0,
  );
  const totalStockUnits = items.reduce(
    (acc, item) => acc + item.currentStock,
    0,
  );

  return {
    totalItems,
    lowStockItems,
    totalStockValue,
    totalStockUnits,
  };
};
