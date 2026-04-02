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
      newItem = await Item.findOneAndUpdate(
        { sku: normalizedSku },
        {
          $set: {
            name: name.trim(),
            price,
            lowStockThreshold:
              lowStockThreshold !== undefined ? lowStockThreshold : 5,
          },
        },
        { upsert: true, new: true, session },
      );

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

          newItem.inventory.push({
            locationId,
            currentStock: quantity || 0,
          });

          if ((quantity || 0) > 0) {
            totalNewStock += quantity;
            await StockMovement.create(
              [
                {
                  itemId: newItem._id,
                  locationId,
                  quantity,
                  type: "IN",
                  reference: "manual",
                  note: "Initial stock on item creation",
                  currentStock: quantity,
                },
              ],
              { session },
            );
          }
        }

        if (totalNewStock > 0) {
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
        locationId: "$locationDetails._id",
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
