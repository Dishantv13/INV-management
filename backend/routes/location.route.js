import { Router } from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
  getLocationItems,
  updateLocationStatus,
  deleteLocation,
} from "../controller/location.controller.js";

const router = Router();

router.route("/").post(createLocation);
router.route("/").get(getAllLocations);
router.route("/:locationId/items").get(getLocationItems);
router.route("/:locationId").get(getLocationById);
router.route("/:locationId").delete(deleteLocation);
router.route("/:locationId/status").patch(updateLocationStatus);

export default router;
