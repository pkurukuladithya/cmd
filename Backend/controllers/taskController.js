// server/controllers/taskController.js
import Task from '../models/TaskModel.js';

// **C**reate a new Task (POST /api/tasks)
export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    const newTask = await Task.create({ title });
    res.status(201).json(newTask); // 201 Created
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **R**ead all Tasks (GET /api/tasks)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}); // Find all tasks
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **U**pdate a Task by ID (PUT /api/tasks/:id)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **D**elete a Task by ID (DELETE /api/tasks/:id)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};