import express from "express";
import { getMyProducts, getSellingHistory } from "../controller/seller.controller.js";

const router = express.Router();

router.post("/get-my-products", getMyProducts);
router.post("/get-selling-history", getSellingHistory);

export default router;

