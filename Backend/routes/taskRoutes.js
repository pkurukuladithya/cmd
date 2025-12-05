// server/routes/taskRoutes.js
import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Base route: /api/tasks

// GET /api/tasks -> Read All
// POST /api/tasks -> Create New
router.route('/').get(getTasks).post(createTask);

// PUT /api/tasks/:id -> Update
// DELETE /api/tasks/:id -> Delete
router.route('/:id').put(updateTask).delete(deleteTask);

export default router;