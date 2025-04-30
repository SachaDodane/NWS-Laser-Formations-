import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Progress from '@/models/Progress';
import Course from '@/models/Course';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { userId, courseId, chapterId } = await request.json();
    
    // Verify user identity
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé à modifier cette progression' },
        { status: 403 }
      );
    }
    
    if (!userId || !courseId || !chapterId) {
      return NextResponse.json(
        { message: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Get course to verify the chapter exists
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    const chapterExists = course.chapters.some(
      (chapter: any) => chapter._id.toString() === chapterId
    );
    
    if (!chapterExists) {
      return NextResponse.json(
        { message: 'Chapitre non trouvé' },
        { status: 404 }
      );
    }
    
    // Get or create progress
    let progress = await Progress.findOne({
      userId,
      courseId,
    });
    
    if (!progress) {
      // Initialize progress if it doesn't exist
      progress = await Progress.create({
        userId,
        courseId,
        startDate: new Date(),
        lastAccessDate: new Date(),
        completedChapters: [chapterId],
        completedQuizzes: [],
        quizResults: [],
        completionPercentage: 0,
        isCompleted: false,
      });
    } else {
      // Update if chapter is not already completed
      if (!progress.completedChapters.includes(chapterId)) {
        progress.completedChapters.push(chapterId);
        progress.lastAccessDate = new Date();
        
        // Calculate new completion percentage
        const totalItems = course.chapters.length + course.quizzes.length;
        const completedItems = progress.completedChapters.length + progress.completedQuizzes.length;
        
        progress.completionPercentage = Math.round((completedItems / totalItems) * 100);
        
        // Check if all chapters and quizzes are completed
        const allChaptersCompleted = course.chapters.every((chapter: any) => 
          progress.completedChapters.includes(chapter._id.toString())
        );
        
        const allQuizzesCompleted = course.quizzes.every((quiz: any) => 
          progress.completedQuizzes.includes(quiz._id.toString())
        );
        
        // Mark course as completed if everything is done
        if (allChaptersCompleted && allQuizzesCompleted) {
          progress.isCompleted = true;
        }
        
        await progress.save();
      }
    }
    
    return NextResponse.json({
      message: 'Chapitre marqué comme terminé',
      completedChapters: progress.completedChapters,
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
    });
  } catch (error: any) {
    console.error('Error marking chapter as complete:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
