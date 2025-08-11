import { Router } from "express";
import { createIssue, updateIssue } from "../controllers/issues.controller";

const router = Router();

// POST /api/issues
router.post("/", createIssue);

// PATCH /api/issues/:id
router.patch("/:id", updateIssue);

export default router;
