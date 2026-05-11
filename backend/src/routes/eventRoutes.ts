import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as eventController from "../controllers/eventController";

const router = Router();

router.get("/", asyncHandler(eventController.getAllEvents));
router.get("/:id", asyncHandler(eventController.getEventById));
router.post("/", asyncHandler(eventController.createEvent));
router.put("/:id", asyncHandler(eventController.updateEvent));
router.delete("/:id", asyncHandler(eventController.deleteEvent));

// Participant management
router.post("/:id/participants", asyncHandler(eventController.addParticipant));
router.delete("/:id/participants/:participantId", asyncHandler(eventController.removeParticipant));

// Volunteer management
router.post("/:id/volunteers", asyncHandler(eventController.addVolunteer));
router.delete("/:id/volunteers/:volunteerId", asyncHandler(eventController.removeVolunteer));

export default router;
