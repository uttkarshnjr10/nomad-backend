import { Router } from "express";
import { getChatHistory } from "../controllers/chatController.js";

const router = Router();

router.get("/history/:room", getChatHistory);

export default router;