import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  deleteLogo,
  upload
} from '../controllers/settingsController';

const router = Router();

// Get system settings
router.get('/', getSettings);

// Update system settings
router.put('/', updateSettings);

// Upload logo
router.post('/logo', upload.single('logo'), uploadLogo);

// Delete logo
router.delete('/logo', deleteLogo);

export default router;
