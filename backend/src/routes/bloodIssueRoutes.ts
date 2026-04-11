import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as bloodIssueController from "../controllers/bloodIssueController";

const router = Router();

router.get("/", asyncHandler(bloodIssueController.getAllBloodIssues));
router.get("/:id", asyncHandler(bloodIssueController.getBloodIssueById));
router.post("/", asyncHandler(bloodIssueController.createBloodIssue));
router.put("/:id", asyncHandler(bloodIssueController.updateBloodIssue));
router.delete("/:id", asyncHandler(bloodIssueController.deleteBloodIssue));

export default router;
