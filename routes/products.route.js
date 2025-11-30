import express from "express";
import { getProducts, createProduct, updateProductStock, deleteProduct } from "../controller/products.controller.js";

const router = express.Router();

router.get("/get-products", getProducts);
router.post("/create-product", createProduct);
router.post("/update-product-stock", updateProductStock);
router.post("/delete-product", deleteProduct);

export default router;

