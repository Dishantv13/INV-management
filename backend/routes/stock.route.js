import { Router } from "express";
import {
  addStock,
  getAllStockHistory,
  removeStock,
  updateStock,
  getStockHistory,
} from "../controller/stockMovement.controller.js";

const router = Router();

router.route("/in").post(addStock);
router.route("/out").post(removeStock);
router.route("/update").post(updateStock);
router.route("/history").get(getAllStockHistory);
router.route("/history/:itemId").get(getStockHistory);

export default router;
