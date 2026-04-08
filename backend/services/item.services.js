import mongoose from "mongoose";
import { Item } from "../models/item.model.js";
import { Location } from "../models/location.model.js";
import { StockMovement } from "../models/stockMovement.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const createItemService = async (itemData) => {
  const { name, sku, price, lowStockThreshold, initialStocks } = itemData;

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

  const session = await mongoose.startSession();
  let newItem;

  try {
    await session.withTransaction(async () => {
      newItem = await Item.findOne({ sku: normalizedSku }).session(session);
      const isNew = !newItem;

      if (isNew) {
        newItem = new Item({
          sku: normalizedSku,
          name: name.trim(),
          price,
          lowStockThreshold:
            lowStockThreshold !== undefined ? lowStockThreshold : 5,
        });
      } else {
        newItem.name = name.trim();
        newItem.price = price;
        if (lowStockThreshold !== undefined) {
          newItem.lowStockThreshold = lowStockThreshold;
        }
      }

      if (initialStocks && Array.isArray(initialStocks)) {
        let totalNewStock = 0;

        for (const stock of initialStocks) {
          const { location: locationId, quantity } = stock;

          if (!mongoose.Types.ObjectId.isValid(locationId)) {
            throw new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              `Invalid location ID: ${locationId}`,
            );
          }

          const locationExists =
            await Location.findById(locationId).session(session);
          if (!locationExists) {
            throw new ApiError(
              HTTP_STATUS.NOT_FOUND,
              `Location not found: ${locationId}`,
            );
          }

          const existingInventory = newItem.inventory.find(
            (inv) => String(inv.locationId) === String(locationId),
          );

          if (existingInventory) {
            throw new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              `Item already has stock mapped to location: ${locationExists.name}`,
            );
          }

          const qty = Number(quantity);

          newItem.inventory.push({
            locationId,
            currentStock: qty || 0,
            openingStock: qty || 0,
          });

          if (qty > 0) {
            totalNewStock += qty;
          }
        }

        if (isNew) {
          newItem.openingStock = totalNewStock;
          newItem.currentStock = totalNewStock;
        } else {
          newItem.currentStock += totalNewStock;
        }

        await newItem.save({ session });
      }
    });
  } finally {
    await session.endSession();
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
    const matchLocation = await Location.find({
      $or: [{ name: searchRegex }, { locationNo: searchRegex }],
    }).select("_id");
    const locationIds = matchLocation.map((loc) => loc._id);
    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { "inventory.locationId": { $in: locationIds } },
    ];
  }

  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });
  const totalItems = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-inventory");

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

export const getDashboardLowStockService = async (query = {}) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  const aggregationPipeline = [
    { $unwind: "$inventory" },
    {
      $match: {
        $expr: { $lte: ["$inventory.currentStock", "$lowStockThreshold"] },
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "inventory.locationId",
        foreignField: "_id",
        as: "locationDetails",
      },
    },
    { $unwind: "$locationDetails" },
    {
      $project: {
        _id: 1,
        name: 1,
        sku: 1,
        price: 1,
        lowStockThreshold: 1,
        currentStockAtLocation: "$inventory.currentStock",
        locationName: "$locationDetails.name",
        locationNo: "$locationDetails.locationNo",
      },
    },
  ];

  const totalResults = await Item.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);
  const totalItems = totalResults.length > 0 ? totalResults[0].total : 0;

  const data = await Item.aggregate([
    ...aggregationPipeline,
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    data,
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const getDashboardStatsService = async () => {
  const items = await Item.find({});
  const totalItems = items.length;

  const lowStockAggregation = await Item.aggregate([
    { $unwind: "$inventory" },
    {
      $match: {
        $expr: { $lte: ["$inventory.currentStock", "$lowStockThreshold"] },
      },
    },
    { $count: "totalLowStockEntries" },
  ]);

  const lowStockItems =
    lowStockAggregation.length > 0
      ? lowStockAggregation[0].totalLowStockEntries
      : 0;

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

export const getItemLocationServices = async (itemId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID format");
  }

  const item = await Item.findById(itemId).select("lowStockThreshold");

  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }

  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  const aggregationPipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(String(itemId)) } },
    { $unwind: "$inventory" },
    {
      $lookup: {
        from: "locations",
        localField: "inventory.locationId",
        foreignField: "_id",
        as: "locationDetails",
      },
    },
    { $unwind: "$locationDetails" },
    {
      $project: {
        _id: 0,
        locationId: "$locationDetails",
        currentStock: "$inventory.currentStock",
        openingStock: "$inventory.openingStock",
      },
    },
  ];

  const totalResults = await Item.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);

  const totalItems = totalResults.length > 0 ? totalResults[0].total : 0;

  const data = await Item.aggregate([
    ...aggregationPipeline,
    { $sort: { "locationId.name": 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    data: {
      lowStockThreshold: item.lowStockThreshold,
      inventory: data,
    },
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const updateItemService = async (itemId, updateData) => {
  const { name, price, lowStockThreshold, initialStocks } = updateData;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID");
  }

  const session = await mongoose.startSession();
  let updatedItem;

  try {
    await session.withTransaction(async () => {
      updatedItem = await Item.findById(itemId).session(session);

      if (!updatedItem) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
      }

      if (name) updatedItem.name = name.trim();
      if (price !== undefined) {
        if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Price must be greater than zero",
          );
        }
        updatedItem.price = price;
      }
      if (lowStockThreshold !== undefined) {
        updatedItem.lowStockThreshold = lowStockThreshold;
      }

      if (initialStocks && Array.isArray(initialStocks)) {
        let totalNewStock = 0;

        for (const stock of initialStocks) {
          const { location: locationId, quantity } = stock;

          if (!mongoose.Types.ObjectId.isValid(locationId)) {
            throw new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              `Invalid location ID: ${locationId}`,
            );
          }

          const locationExists =
            await Location.findById(locationId).session(session);
          if (!locationExists) {
            throw new ApiError(
              HTTP_STATUS.NOT_FOUND,
              `Location not found: ${locationId}`,
            );
          }

          const existingInventory = updatedItem.inventory.find(
            (inv) => String(inv.locationId) === String(locationId),
          );

          if (existingInventory) {
            throw new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              `Item already has stock mapped to location: ${locationExists.name}`,
            );
          }

          const qty = Number(quantity) || 0;

          updatedItem.inventory.push({
            locationId,
            currentStock: qty,
            openingStock: qty,
          });

          totalNewStock += qty;
        }

        updatedItem.currentStock += totalNewStock;
        updatedItem.openingStock += totalNewStock;
      }

      await updatedItem.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return updatedItem;
};

export const deleteItemService = async (itemId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID");
  }

  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }

  if (item.currentStock > 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Item has stock, cannot delete");
  }

  await StockMovement.deleteMany({ itemId });

  await Item.findByIdAndDelete(itemId);

  return item;
};