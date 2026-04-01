import { Location } from "../models/location.model.js";
import { Item } from "../models/item.model.js";
import { StockMovement } from "../models/stockMovement.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const createLocationService = async (locationData) => {
  const { name, locationNo } = locationData;
  if (!name || !locationNo) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name and Location Number are required",
    );
  }

  const existingLocation = await Location.findOne({
    locationNo: locationNo.trim(),
  });
  if (existingLocation) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Location with this Location Number already exists",
    );
  }

  const newLocation = await Location.create({
    name: name.trim(),
    locationNo: locationNo.trim(),
    status: "active",
  });
  return newLocation;
};

export const getAllLocationsService = async (query = {}) => {
  const filter = {};
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  if (query.status === "active" || query.status === "inactive") {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { locationNo: searchRegex }];
  }

  const totalItems = await Location.countDocuments(filter);
  const locations = await Location.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: locations,
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const getLocationByIdService = async (locationId) => {
  const location = await Location.findById(locationId);
  if (!location) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Location not found");
  }
  return location;
};

export const updateLocationStatusService = async (locationId, status) => {
  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Status must be 'active' or 'inactive'",
    );
  }

  const location = await Location.findByIdAndUpdate(
    locationId,
    { status },
    { returnDocument: "after", runValidators: true },
  );

  if (!location) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Location not found");
  }

  return location;
};

export const deleteLocationService = async (locationId) => {
  const location = await Location.findByIdAndDelete(locationId);
  if (!location) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Location not found");
  }
  return location;
};

export const getLocationItemService = async (locationId, query = {}) => {
  const filter = {};
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  if (query.lowStock === "true") {
    filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }
  const totalItems = await Item.countDocuments({ location: locationId });
  const items = await Item.find({ location: locationId })
    .select("name sku currentStock lowStockThreshold")
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

export const getLocationItemsMovementService = async (
  locationId,
  query = {},
) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });

  if (!mongoose.Types.ObjectId.isValid(locationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid locationId");
  }

  const location = await Location.findById(locationId);
  if (!location) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Location not found");
  }

  const result = await StockMovement.aggregate([
    { $match: { locationId: new mongoose.Types.ObjectId(locationId) } },

    { $sort: { itemId: 1, createdAt: -1 } },

    {
      $group: {
        _id: "$itemId",
        currentStock: { $first: "$currentStock" },
      },
    },

    {
      $facet: {
        data: [{ $sort: { _id: 1 } }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ]);

  const latestMovements = result[0]?.data || [];
  const totalItems = result[0]?.totalCount[0]?.total || 0;

  const items = await Item.find({ location: locationId })
    .select("name sku lowStockThreshold")
    .lean();

  const itemMap = new Map(items.map((item) => [String(item._id), item]));

  const data = latestMovements.map((movement) => {
    const item = itemMap.get(String(movement._id));

    return {
      itemId: movement._id,
      name: item?.name,
      sku: item?.sku,
      currentStock: movement.currentStock || 0,
      isLowStock:
        (movement.currentStock || 0) <= (item?.lowStockThreshold || 0),
    };
  });

  return {
    data,
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};
