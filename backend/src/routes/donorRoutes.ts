import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as donorController from "../controllers/donorController";

const router = Router();

router.get("/", asyncHandler(donorController.getAllDonors));
router.get("/:id", asyncHandler(donorController.getDonorById));
router.post("/", asyncHandler(donorController.createDonor));
router.put("/:id", asyncHandler(donorController.updateDonor));
router.delete("/:id", asyncHandler(donorController.deleteDonor));

export default router;
