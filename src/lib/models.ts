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

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  userId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
