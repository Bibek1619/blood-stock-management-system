import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as bloodStockController from "../controllers/bloodStockController";

const router = Router();

router.get("/", asyncHandler(bloodStockController.getBloodStock));
router.get("/summary", asyncHandler(bloodStockController.getBloodStockSummary));
router.get("/:id", asyncHandler(bloodStockController.getBloodPackById));
router.post("/", asyncHandler(bloodStockController.createBloodPack));
router.put("/:id", asyncHandler(bloodStockController.updateBloodPack));
router.delete("/:id", asyncHandler(bloodStockController.deleteBloodPack));

export default router;
