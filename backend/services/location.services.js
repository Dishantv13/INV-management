import { Location } from "../models/location.model.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const createLocationService = async (locationData) => {
  const { name, locationNo } = locationData;
  if (!name || !locationNo) {
    throw new Error("Name and Location Number are required");
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
    throw new Error("Location not found");
  }
  return location;
};

export const updateLocationStatusService = async (locationId, status) => {
  if (!["active", "inactive"].includes(status)) {
    throw new Error("Status must be 'active' or 'inactive'");
  }

  const location = await Location.findByIdAndUpdate(
    locationId,
    { status },
    { new: true, runValidators: true },
  );

  if (!location) {
    throw new Error("Location not found");
  }

  return location;
};

export const deleteLocationService = async (locationId) => {
  const location = await Location.findByIdAndDelete(locationId);
  if (!location) {
    throw new Error("Location not found");
  }
  return location;
};
