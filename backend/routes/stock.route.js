import { Router } from "express";
import {
  adjustStock,
  getAllStockHistory,
  getStockHistory,
} from "../controller/stockMovement.controller.js";

const router = Router();

router.route("/adjust").post(adjustStock);
router.route("/history").get(getAllStockHistory);
router.route("/history/:itemId").get(getStockHistory);


export default router;
