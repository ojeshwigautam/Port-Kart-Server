import express from "express";
import { getCartItems, updateCartQuantity, addToCart, removeFromCart } from "../controller/cart.controller.js";

const router = express.Router();

router.post("/get-cart-items", getCartItems);
router.post("/add-to-cart", addToCart);
router.post("/update-cart-quantity", updateCartQuantity);
router.post("/remove-from-cart", removeFromCart);


export default router;
