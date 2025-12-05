// server/models/TaskModel.js
import mongoose from 'mongoose';

// Define the Schema (Blueprint)
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true, // Removes whitespace from both ends of a string
  },
  completed: {
    type: Boolean,
    default: false, // Tasks start as incomplete by default
  },
}, {
  timestamps: true, // Adds 'createdAt' and 'updatedAt' fields automatically
});

// Create and export the Model
const Task = mongoose.model('Task', taskSchema);

export default Task;