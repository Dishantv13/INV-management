import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  getDashboardStats,
  getDashboardLowStock,
  getItemLocation,
} from "../controller/item.controller.js";

const router = Router();

router.route("/").post(createItem);
router.route("/").get(getAllItems);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/dashboard/low-stock").get(getDashboardLowStock);
router.route("/:id").get(getItemById);
router.route("/:id/locations").get(getItemLocation);

export default router;
