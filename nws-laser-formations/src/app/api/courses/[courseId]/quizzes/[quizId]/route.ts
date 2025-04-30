import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string; quizId: string } }
) {
  try {
    // Dans Next.js 14+, les paramètres peuvent être une promesse
    const params = context.params;
    const { courseId, quizId } = params;
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Check if user has access to this course
    const user = await User.findById(session.user.id);
    if (!user || !user.courses.some((id: any) => id.toString() === courseId)) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas accès à cette formation' },
        { status: 403 }
      );
    }
    
    // Get the course
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // Find the quiz - s'assurer que course.quizzes est un tableau
    if (!Array.isArray(course.quizzes)) {
      return NextResponse.json(
        { message: 'Format de quiz invalide' },
        { status: 500 }
      );
    }
    
    const quiz = course.quizzes.find((q: any) => q._id && q._id.toString() === quizId);
    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz non trouvé' },
        { status: 404 }
      );
    }
    
    // Get user's progress for this course
    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId: courseId,
    }).lean();
    
    if (!progress) {
      return NextResponse.json(
        { message: 'Progression non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si progress.quizResults est un tableau
    if (!Array.isArray(progress.quizResults)) {
      return NextResponse.json(
        { message: 'Format de résultats invalide' },
        { status: 500 }
      );
    }
    
    // Find quiz result if exists
    const quizResult = progress.quizResults.find(
      (result: any) => result.quizId && result.quizId.toString() === quizId
    );
    
    // Get certificate if exists
    const certificate = progress.certificate ? {
      ...progress.certificate,
      issuedDate: progress.certificate.issuedDate ? new Date(progress.certificate.issuedDate).toISOString() : undefined
    } : null;
    
    // Format response data - always ensure MongoDB objects are converted to plain objects
    const formatQuiz = (quiz: any) => {
      // Remove correct answers if quiz hasn't been taken yet
      if (!quizResult) {
        return {
          _id: quiz._id.toString(),
          title: quiz.title,
          description: quiz.description,
          isFinal: quiz.isFinal || false,
          passingScore: quiz.passingScore || 70,
          questions: quiz.questions ? quiz.questions.map((q: any) => ({
            _id: q._id ? q._id.toString() : undefined,
            question: q.question,
            options: q.options ? q.options.map((opt: any) => ({
              ...opt,
              _id: opt._id ? opt._id.toString() : undefined
            })) : [],
            // Don't include correctAnswer or explanation
          })) : [],
        };
      }
      
      // Include correct answers if quiz has been taken
      return {
        _id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        isFinal: quiz.isFinal || false,
        passingScore: quiz.passingScore || 70,
        questions: quiz.questions ? quiz.questions.map((q: any) => ({
          _id: q._id ? q._id.toString() : undefined,
          question: q.question,
          options: q.options ? q.options.map((opt: any) => ({
            ...opt,
            _id: opt._id ? opt._id.toString() : undefined
          })) : [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })) : [],
      };
    };
    
    const formatCourse = (course: any) => ({
      _id: course._id.toString(),
      title: course.title,
      chapters: Array.isArray(course.chapters) ? course.chapters.map((chapter: any) => ({
        _id: chapter._id ? chapter._id.toString() : undefined,
        title: chapter.title,
        order: chapter.order || 0,
      })) : [],
    });
    
    const formatQuizResult = (result: any) => {
      if (!result) return null;
      
      return {
        _id: result._id ? result._id.toString() : undefined,
        quizId: result.quizId ? result.quizId.toString() : undefined,
        score: result.score,
        passed: result.passed,
        answers: result.answers || [],
        submittedAt: result.submittedAt ? new Date(result.submittedAt).toISOString() : undefined,
      };
    };
    
    return NextResponse.json({
      quiz: formatQuiz(quiz),
      course: formatCourse(course),
      quizResult: formatQuizResult(quizResult),
      certificate: certificate,
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
