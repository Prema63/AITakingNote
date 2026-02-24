import express from "express";
import { registerUser,loginUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/login",authenticate, registerUser);


export default router;