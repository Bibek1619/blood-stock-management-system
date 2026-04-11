import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as certificateController from "../controllers/certificateController";

const router = Router();

router.get("/", asyncHandler(certificateController.getAllCertificates));
router.get("/:id", asyncHandler(certificateController.getCertificateById));
router.get("/number/:certificateNumber", asyncHandler(certificateController.getCertificateByNumber));
router.post("/", asyncHandler(certificateController.createCertificate));
router.delete("/:id", asyncHandler(certificateController.deleteCertificate));

export default router;
