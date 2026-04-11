import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as certificateController from "../controllers/certificateController";
import { createCertificateSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(certificateController.getAllCertificates));
router.get("/:id", asyncHandler(certificateController.getCertificateById));
router.get("/number/:certificateNumber", asyncHandler(certificateController.getCertificateByNumber));
router.post("/", validateRequest(createCertificateSchema), asyncHandler(certificateController.createCertificate));
router.delete("/:id", asyncHandler(certificateController.deleteCertificate));

export default router;
