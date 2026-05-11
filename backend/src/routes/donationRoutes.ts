import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as donationController from "../controllers/donationController";

const router = Router();

// Search endpoints - MUST come before /:id to avoid route conflicts
router.get("/search/donors", asyncHandler(donationController.searchDonors));
router.get("/search/organizations", asyncHandler(donationController.searchOrganizations));

// Blood collection endpoints
router.post("/collect", asyncHandler(donationController.recordBloodCollection));
router.post("/bulk-collect", asyncHandler(donationController.recordBulkCollection));

// CRUD endpoints
router.get("/", asyncHandler(donationController.getAllDonations));
router.get("/:id", asyncHandler(donationController.getDonationById));
router.post("/", asyncHandler(donationController.createDonation));
router.put("/:id", asyncHandler(donationController.updateDonation));
router.delete("/:id", asyncHandler(donationController.deleteDonation));

export default router;
