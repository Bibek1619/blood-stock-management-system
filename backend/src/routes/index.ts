import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import donorRoutes from "./donorRoutes";
import donationRoutes from "./donationRoutes";
import bloodStockRoutes from "./bloodStockRoutes";
import bloodIssueRoutes from "./bloodIssueRoutes";
import eventRoutes from "./eventRoutes";
import certificateRoutes from "./certificateRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/donors", donorRoutes);
router.use("/donations", donationRoutes);
router.use("/blood-stock", bloodStockRoutes);
router.use("/blood-issues", bloodIssueRoutes);
router.use("/events", eventRoutes);
router.use("/certificates", certificateRoutes);

export default router;
