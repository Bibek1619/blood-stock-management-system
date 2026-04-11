import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as donationController from "../controllers/donationController";
import { createDonationSchema, updateDonationSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(donationController.getAllDonations));
router.get("/:id", asyncHandler(donationController.getDonationById));
router.post("/", validateRequest(createDonationSchema), asyncHandler(donationController.createDonation));
router.put("/:id", validateRequest(updateDonationSchema), asyncHandler(donationController.updateDonation));
router.delete("/:id", asyncHandler(donationController.deleteDonation));

export default router;
