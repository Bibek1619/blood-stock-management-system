import { Router } from "express";
import {
  getDailySummary,
  getDonorActivity,
  getDonorRetention,
  getGeographicData,
  getUsageTrends,
  getSeasonalPatterns,
  getPredictions,
  getCampaigns,
  createCampaign,
  updateCampaign,
  getDashboardOverview,
} from "../controllers/analyticsController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Dashboard overview
router.get("/overview", asyncHandler(getDashboardOverview));

// Daily summary data
router.get("/daily-summary", asyncHandler(getDailySummary));

// Donor activity and retention
router.get("/donor-activity", asyncHandler(getDonorActivity));
router.get("/donor-retention", asyncHandler(getDonorRetention));

// Geographic data
router.get("/geographic", asyncHandler(getGeographicData));

// Usage trends
router.get("/usage-trends", asyncHandler(getUsageTrends));

// Seasonal patterns
router.get("/seasonal-patterns", asyncHandler(getSeasonalPatterns));

// Predictions
router.get("/predictions", asyncHandler(getPredictions));

// Campaigns
router.get("/campaigns", asyncHandler(getCampaigns));
router.post("/campaigns", asyncHandler(createCampaign));
router.put("/campaigns/:id", asyncHandler(updateCampaign));

export default router;
