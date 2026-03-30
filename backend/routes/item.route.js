import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  getDashboardStats,
} from "../controller/item.controller.js";

const router = Router();

router.route("/").post(createItem);
router.route("/").get(getAllItems);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/:id").get(getItemById);

export default router;
