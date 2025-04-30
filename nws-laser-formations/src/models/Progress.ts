import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult {
  quizId: mongoose.Types.ObjectId;
  score: number;
  passed: boolean;
  attempts: number;
  lastAttemptDate: Date;
}

export interface IChapterProgress {
  chapterId: mongoose.Types.ObjectId;
  completed: boolean;
  lastAccessDate: Date;
}

export interface ICertificate {
  issuedDate: Date;
  certificateUrl: string;
}

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  chapterProgress: IChapterProgress[];
  quizResults: IQuizResult[];
  certificate?: ICertificate;
  startDate: Date;
  lastAccessDate: Date;
  completionPercentage: number;
  isCompleted: boolean;
}

const QuizResultSchema = new Schema<IQuizResult>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Course.quizzes',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  lastAttemptDate: {
    type: Date,
    default: Date.now,
  },
});

const ChapterProgressSchema = new Schema<IChapterProgress>({
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: 'Course.chapters',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  lastAccessDate: {
    type: Date,
    default: Date.now,
  },
});

const CertificateSchema = new Schema<ICertificate>({
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  certificateUrl: {
    type: String,
    required: true,
  },
});

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterProgress: [ChapterProgressSchema],
    quizResults: [QuizResultSchema],
    certificate: CertificateSchema,
    startDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessDate: {
      type: Date,
      default: Date.now,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only have one progress record per course
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
