import mongoose from 'mongoose';

// Define Notification schema
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['success', 'info', 'warning', 'error'],
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // Optional references to related entities
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
  },
  quizId: {
    type: String, // We store the string ID of the quiz within the course
    default: null,
  },
  // For certificate notifications
  certificateId: {
    type: String,
    default: null,
  },
  // For clickable actions
  actionUrl: {
    type: String,
    default: null,
  },
  actionLabel: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

// Try to get the existing model, or create a new one
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
