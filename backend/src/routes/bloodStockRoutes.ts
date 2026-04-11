import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as bloodStockController from "../controllers/bloodStockController";
import { createBloodPackSchema, updateBloodPackSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(bloodStockController.getBloodStock));
router.get("/summary", asyncHandler(bloodStockController.getBloodStockSummary));
router.get("/:id", asyncHandler(bloodStockController.getBloodPackById));
router.post("/", validateRequest(createBloodPackSchema), asyncHandler(bloodStockController.createBloodPack));
router.put("/:id", validateRequest(updateBloodPackSchema), asyncHandler(bloodStockController.updateBloodPack));
router.delete("/:id", asyncHandler(bloodStockController.deleteBloodPack));

export default router;
