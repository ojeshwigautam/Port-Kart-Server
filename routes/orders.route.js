import express from "express";
import { getOrders } from "../controller/orders.controller.js";

const router = express.Router();

router.post("/get-orders", getOrders);

export default router;

