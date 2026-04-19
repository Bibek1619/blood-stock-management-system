import { Router } from "express";
import {
  requestAccountClaim,
  verifyAndClaimAccount,
  checkExistingAccount,
  resendVerificationCode,
} from "../controllers/accountClaimController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Check if account exists (for registration form)
router.get("/check", asyncHandler(checkExistingAccount));

// Request account claim (send verification code)
router.post("/request", asyncHandler(requestAccountClaim));

// Verify code and claim account
router.post("/verify", asyncHandler(verifyAndClaimAccount));

// Resend verification code
router.post("/resend", asyncHandler(resendVerificationCode));

export default router;
