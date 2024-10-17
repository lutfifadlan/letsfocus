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

const CommentSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  userId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  group: { type: String, default: null },
  dueDate: { type: Date, default: null },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'IGNORED'], default: 'PENDING' },
  completedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  ignoredAt: { type: Date, default: null },
  completionStatus: { type: String },
  priority: { type: String, default: null },
  isCurrentlyFocused: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

const UserPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  plan: { type: String, default: 'FREE' },
  isDeleted: { type: Boolean, default: false },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  paymentIds: { type: [String] },
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  externalId: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number },
  paidAt: { type: Date, required: true },
  paymentMethod: { type: String, required: true },
  currency: { type: String, required: true },
  paymentGateway: { type: String, required: true },
  status: { type: String, required: true },
}, { timestamps: true });

const ContactMessageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.index({ email: 1, isDeleted: 1 });

GroupSchema.index({ userId: 1, isDeleted: 1 });

TaskSchema.index({ userId: 1, isDeleted: 1 });

UserPlanSchema.index({ userId: 1, isDeleted: 1 });

CommentSchema.index({ userId: 1,taskId: 1, isDeleted: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
export const UserPlan = mongoose.models.UserPlan || mongoose.model('UserPlan', UserPlanSchema);
export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
