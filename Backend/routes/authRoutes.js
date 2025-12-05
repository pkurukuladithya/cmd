import express from 'express';
import {
  getGoogleAuthUrl,
  getProfile,
  handleGoogleCallback,
  loginUser,
  registerUser,
  completeGoogleSignup,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google/complete', completeGoogleSignup);
router.get('/me', protect, getProfile);

router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);

export default router;
