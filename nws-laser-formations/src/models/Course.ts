import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IQuiz {
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  isFinal: boolean;  // True if this is the final quiz
  passingScore: number;  // Percentage required to pass (e.g., 80)
}

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  image: string;
  chapters: IChapter[];
  quizzes: IQuiz[];
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  title: {
    type: String,
    required: [true, 'Le titre du chapitre est requis'],
  },
  content: {
    type: String,
    required: [true, 'Le contenu du chapitre est requis'],
  },
  videoUrl: {
    type: String,
  },
  order: {
    type: Number,
    required: true,
  },
});

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: {
    type: String,
    required: [true, 'La question est requise'],
  },
  options: [{
    type: String,
    required: [true, 'Les options sont requises'],
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'La réponse correcte est requise'],
  },
  explanation: {
    type: String,
  },
});

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: [true, 'Le titre du quiz est requis'],
  },
  description: {
    type: String,
  },
  questions: [QuizQuestionSchema],
  isFinal: {
    type: Boolean,
    default: false,
  },
  passingScore: {
    type: Number,
    default: 80,  // Default to 80%
  },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la formation est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description de la formation est requise'],
    },
    price: {
      type: Number,
      required: [true, 'Le prix de la formation est requis'],
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    image: {
      type: String,
      default: '/images/courses/default.jpg'
    },
    chapters: [ChapterSchema],
    quizzes: [QuizSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
