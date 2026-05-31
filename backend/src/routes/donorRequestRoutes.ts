import { Router } from 'express';
import {
  getPendingDonorRequests,
  getDonorRequestById,
  approveDonorRequest,
  rejectDonorRequest,
} from '../controllers/donorRequestController';

const router = Router();

// Get all pending donor requests (no auth)
router.get('/', getPendingDonorRequests);

// Get donor request details by ID (no auth)
router.get('/:id', getDonorRequestById);

// Approve donor request (no auth for now)
router.post('/:id/approve', approveDonorRequest);

// Reject donor request (no auth for now)
router.post('/:id/reject', rejectDonorRequest);

export default router;
