import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as bloodIssueController from "../controllers/bloodIssueController";
import { createBloodIssueSchema, updateBloodIssueSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(bloodIssueController.getAllBloodIssues));
router.get("/:id", asyncHandler(bloodIssueController.getBloodIssueById));
router.post("/", validateRequest(createBloodIssueSchema), asyncHandler(bloodIssueController.createBloodIssue));
router.put("/:id", validateRequest(updateBloodIssueSchema), asyncHandler(bloodIssueController.updateBloodIssue));
router.delete("/:id", asyncHandler(bloodIssueController.deleteBloodIssue));

export default router;
