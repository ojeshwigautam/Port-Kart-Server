import express from "express";
import { createUserProfile, getTotalUsers, getUserProfile } from "../controller/profile.controller.js";

const router = express.Router();

router.post("/create-user-profile", createUserProfile);
router.get("/get-total-users", getTotalUsers);
router.post("/get-user-profile", getUserProfile);


export default router;
