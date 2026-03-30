import {
  createLocationService,
  getAllLocationsService,
  getLocationByIdService,
  updateLocationStatusService,
  deleteLocationService,
} from "../services/location.services.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import { LOCATION } from "../utils/successMessage.js";

export const createLocation = asyncHandler(async (req, res) => {
  const locationData = req.body;
  const location = await createLocationService(locationData);
  successResponse(res, location, HTTP_STATUS.CREATED, LOCATION.CREATED);
});

export const getAllLocations = asyncHandler(async (req, res) => {
  const { data, pagination } = await getAllLocationsService(req.query);
  successResponse(res, data, HTTP_STATUS.OK, LOCATION.RETRIEVED, pagination);
});

export const getLocationById = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  const location = await getLocationByIdService(locationId);
  successResponse(res, location, HTTP_STATUS.OK, LOCATION.RETRIEVED);
});

export const updateLocationStatus = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  const { status } = req.body;
  const location = await updateLocationStatusService(locationId, status);
  successResponse(res, location, HTTP_STATUS.OK, LOCATION.UPDATED);
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  await deleteLocationService(locationId);
  successResponse(res, null, HTTP_STATUS.OK, LOCATION.DELETED);
});
