import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nextAuthUserId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  image: String,
  isFirstLogin: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  consent: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const HabitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
}, { timestamps: true });

const FocusTimeSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  userId: { type: String, required: true },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  userId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
export const FocusTime = mongoose.models.FocusTime || mongoose.model('FocusTime', FocusTimeSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);