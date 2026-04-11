import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as userController from "../controllers/userController";
import { createUserSchema, updateUserSchema } from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.post("/", validateRequest(createUserSchema), asyncHandler(userController.createUser));
router.put("/:id", validateRequest(updateUserSchema), asyncHandler(userController.updateUser));
router.delete("/:id", asyncHandler(userController.deleteUser));

export default router;
