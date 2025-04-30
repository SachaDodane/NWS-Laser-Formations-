import { DefaultSession } from "next-auth";
import { IChapter, IQuiz, IQuizQuestion } from "@/models/Course";

// Extend the next-auth types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  chapters: Chapter[];
  quizzes: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter extends Omit<IChapter, '_id'> {
  _id?: string;
}

export interface Quiz extends Omit<IQuiz, '_id'> {
  _id?: string;
}

export interface QuizQuestion extends IQuizQuestion {
  _id?: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  attempts: number;
  lastAttemptDate: string;
}

export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  lastAccessDate: string;
}

export interface Certificate {
  issuedDate: string;
  certificateUrl: string;
}

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  chapterProgress: ChapterProgress[];
  quizResults: QuizResult[];
  certificate?: Certificate;
  startDate: string;
  lastAccessDate: string;
  completionPercentage: number;
  isCompleted: boolean;
}

export interface CourseWithProgress extends Course {
  progress?: Progress;
}
