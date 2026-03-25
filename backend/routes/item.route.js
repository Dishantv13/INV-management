import { Router } from "express";
import { createItem, getAllItems, getItemById } from "../controller/item.controller.js";

const router = Router();

router.route("/").post(createItem).get(getAllItems);
router.route("/:id").get(getItemById);

export default router;