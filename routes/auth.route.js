import express from "express";
import { signUp, login, logout, getCurrentUser } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/me", getCurrentUser);
router.post("/logout", logout);


export default router;
