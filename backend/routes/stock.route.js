import { Router } from "express";
import {
  addStock,
  getAllStockHistory,
  removeStock,
  getStockHistory,
} from "../controller/stockMovement.controller.js";

const router = Router();

router.route("/in").post(addStock);
router.route("/out").post(removeStock);
router.route("/history").get(getAllStockHistory);
router.route("/history/:itemId").get(getStockHistory);


export default router;
