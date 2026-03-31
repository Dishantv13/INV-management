import { Location } from "../models/location.model.js";
import { Item } from "../models/item.model.js";
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
    { new: true, runValidators: true },
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

export const getLocationItemsService = async (locationId, query = {}) => {

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
