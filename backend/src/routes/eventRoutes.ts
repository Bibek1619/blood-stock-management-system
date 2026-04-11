import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import * as eventController from "../controllers/eventController";
import { 
  createEventSchema, 
  updateEventSchema, 
  registerParticipantSchema, 
  registerVolunteerSchema 
} from "../validators/schemas";

const router = Router();

router.get("/", asyncHandler(eventController.getAllEvents));
router.get("/:id", asyncHandler(eventController.getEventById));
router.post("/", validateRequest(createEventSchema), asyncHandler(eventController.createEvent));
router.put("/:id", validateRequest(updateEventSchema), asyncHandler(eventController.updateEvent));
router.delete("/:id", asyncHandler(eventController.deleteEvent));

// Participant registration
router.post("/participants", validateRequest(registerParticipantSchema), asyncHandler(eventController.registerParticipant));

// Volunteer registration
router.post("/volunteers", validateRequest(registerVolunteerSchema), asyncHandler(eventController.registerVolunteer));

export default router;
