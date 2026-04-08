import { Location } from "../models/location.model.js";
import { Item } from "../models/item.model.js";
import { StockMovement } from "../models/stockMovement.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";
import mongoose from "mongoose";

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
    locationNo: locationNo.trim().toUpperCase(),
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

  const locations = await Location.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await Location.countDocuments(filter);
  const totalStockByLocation = await Item.aggregate([
    {
      $unwind: "$inventory",
    },
    {
      $group: {
        _id: "$inventory.locationId",
        totalStock: { $sum: "$inventory.currentStock" },
      },
    },
  ]);

  const stockMap = {};
  totalStockByLocation.forEach((item) => {
    stockMap[item._id.toString()] = item.totalStock;
  });

  const locationsWithStock = locations.map((loc) => {
    const locObj = loc.toObject();

    return {
      ...locObj,
      totalStock: stockMap[loc._id.toString()] || 0,
    };
  });

  return {
    data: locationsWithStock,
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

  const objectId = new mongoose.Types.ObjectId(locationId);
  const itemExist = await Item.exists({
    inventory: {
      $elemMatch: {
        locationId: objectId,
        currentStock: { $gt: 0 }
      }
    }
  });

  if (itemExist) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot delete location: Items are still assigned to this location");
  }

  await Item.updateMany({}, {
    $pull: {
      inventory: {
        $or: [{ locationId: objectId }, { locationId: locationId }]
      }
    }
  });

  const location = await Location.findByIdAndDelete(objectId);
  if (!location) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Location not found");
  }
  await StockMovement.deleteMany({ locationId: objectId });

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
  const totalItems = await Item.countDocuments({
    ...filter,
    "inventory.locationId": locationId,
  });
  const items = await Item.find({
    ...filter,
    "inventory.locationId": locationId,
  })
    .select("name sku inventory lowStockThreshold")
    .skip(skip)
    .limit(limit);

  return {
    data: items.map((item) => {
      const inventoryEntry = item.inventory.find(
        (inv) => String(inv.locationId) === String(locationId),
      );
      const currentStockAtLocation = inventoryEntry?.currentStock || 0;

      return {
        _id: item._id,
        name: item.name,
        sku: item.sku,
        currentStock: currentStockAtLocation,
        lowStockThreshold: item.lowStockThreshold,
        isLowStock: currentStockAtLocation <= item.lowStockThreshold,
      };
    }),
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};
