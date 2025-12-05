import express from 'express';
import { getUsers, updateUser } from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, requireAdmin, getUsers);
router.route('/:id').patch(protect, requireAdmin, updateUser);

export default router;
