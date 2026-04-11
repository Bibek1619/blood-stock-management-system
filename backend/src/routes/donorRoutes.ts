import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as donorController from "../controllers/donorController";
import { createDonorSchema, updateDonorSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(donorController.getAllDonors));
router.get("/:id", asyncHandler(donorController.getDonorById));
router.post("/", validateRequest(createDonorSchema), asyncHandler(donorController.createDonor));
router.put("/:id", validateRequest(updateDonorSchema), asyncHandler(donorController.updateDonor));
router.delete("/:id", asyncHandler(donorController.deleteDonor));

export default router;
