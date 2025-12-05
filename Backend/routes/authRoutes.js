import express from 'express';
import {
  getGoogleAuthUrl,
  getProfile,
  handleGoogleCallback,
  loginUser,
  registerUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getProfile);

router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);

export default router;
