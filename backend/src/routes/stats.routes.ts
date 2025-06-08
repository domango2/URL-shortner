import { Router } from "express";
import { getStatsByShortCode } from "../controllers/stats.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.get("/:shortCode", authenticateJWT, getStatsByShortCode);

export default router;
