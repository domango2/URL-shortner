import { Router } from "express";
import {
  createShortLink,
  redirectToOriginal,
  getUserLinks,
  deleteLink,
  updateLink,
} from "../controllers/link.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getUserLinks);
router.post("/", authenticateJWT, createShortLink);
router.delete("/:id", authenticateJWT, deleteLink);
router.get("/:shortCode", redirectToOriginal);

export default router;
