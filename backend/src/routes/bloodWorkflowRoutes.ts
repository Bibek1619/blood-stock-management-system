import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";

// Blood Collection Controllers
import {
  getBloodCollections,
  getBloodCollectionById,
  createBloodCollection,
  updateBloodCollectionStatus,
  deleteBloodCollection,
  getPendingCollections,
  getApprovedCollections,
  getRejectedCollections,
} from "../controllers/bloodCollectionController";

// Blood Test Controllers
import {
  createOrUpdateBloodTest,
  getBloodTestByCollectionId,
  getAllBloodTests,
} from "../controllers/bloodTestController";

// Blood Stock Workflow Controllers
import {
  moveToStock,
  getBloodStock,
  getBloodStockSummary,
  issueBlood,
  getBloodIssues,
  getBloodIssueById,
} from "../controllers/bloodStockWorkflowController";

const router = Router();

// ==================== Blood Collection Routes ====================
router.get(
  "/collections",
  asyncHandler(getBloodCollections)
);

router.get(
  "/collections/pending",
  asyncHandler(getPendingCollections)
);

router.get(
  "/collections/approved",
  asyncHandler(getApprovedCollections)
);

router.get(
  "/collections/rejected",
  asyncHandler(getRejectedCollections)
);

router.get(
  "/collections/:id",
  asyncHandler(getBloodCollectionById)
);

router.post(
  "/collections",
  asyncHandler(createBloodCollection)
);

router.patch(
  "/collections/:id/status",
  asyncHandler(updateBloodCollectionStatus)
);

router.delete(
  "/collections/:id",
  asyncHandler(deleteBloodCollection)
);

// ==================== Blood Test Routes ====================
router.get(
  "/tests",
  asyncHandler(getAllBloodTests)
);

router.get(
  "/tests/:bloodCollectionId",
  asyncHandler(getBloodTestByCollectionId)
);

router.post(
  "/tests/:bloodCollectionId",
  asyncHandler(createOrUpdateBloodTest)
);

// ==================== Blood Stock Workflow Routes ====================
router.post(
  "/stock/move",
  asyncHandler(moveToStock)
);

router.get(
  "/stock",
  asyncHandler(getBloodStock)
);

router.get(
  "/stock/summary",
  asyncHandler(getBloodStockSummary)
);

// ==================== Blood Issue Routes ====================
router.post(
  "/issues",
  asyncHandler(issueBlood)
);

router.get(
  "/issues",
  asyncHandler(getBloodIssues)
);

router.get(
  "/issues/:id",
  asyncHandler(getBloodIssueById)
);

export default router;
