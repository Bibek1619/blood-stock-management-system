import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.post("/", asyncHandler(userController.createUser));
router.put("/:id", asyncHandler(userController.updateUser));
router.delete("/:id", asyncHandler(userController.deleteUser));

export default router;
