import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as donationController from "../controllers/donationController";

const router = Router();

router.get("/", asyncHandler(donationController.getAllDonations));
router.get("/:id", asyncHandler(donationController.getDonationById));
router.post("/", asyncHandler(donationController.createDonation));
router.put("/:id", asyncHandler(donationController.updateDonation));
router.delete("/:id", asyncHandler(donationController.deleteDonation));

// Blood collection endpoint
router.post("/collect", asyncHandler(donationController.recordBloodCollection));

// Bulk blood collection endpoint
router.post("/bulk-collect", asyncHandler(donationController.recordBulkCollection));

// Search donors endpoint
router.get("/search/donors", asyncHandler(donationController.searchDonors));

export default router;
