import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as eventController from "../controllers/eventController";

const router = Router();

router.get("/", asyncHandler(eventController.getAllEvents));
router.get("/:id", asyncHandler(eventController.getEventById));
router.post("/", asyncHandler(eventController.createEvent));
router.put("/:id", asyncHandler(eventController.updateEvent));
router.delete("/:id", asyncHandler(eventController.deleteEvent));

// Participant registration
router.post("/participants", asyncHandler(eventController.registerParticipant));

// Volunteer registration
router.post("/volunteers", asyncHandler(eventController.registerVolunteer));

export default router;
