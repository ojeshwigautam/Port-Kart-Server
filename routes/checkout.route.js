import express from "express";
import { dummyCheckout } from "../controller/checkout.controller.js";

const router = express.Router();

router.post("/checkout", dummyCheckout);

export default router;

