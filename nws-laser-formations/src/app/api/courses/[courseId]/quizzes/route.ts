import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';

// Définir une interface pour le modèle Course pour corriger les erreurs TypeScript
interface CourseDocument {
  _id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  quizzes?: Array<{
    _id: any;
    title: string;
    description?: string;
    isFinal?: boolean;
    passingScore?: number;
    questions?: Array<{
      _id?: any;
      question: string;
      options?: Array<string>;
      correctAnswers?: Array<number>;
      explanation?: string;
    }>;
  }>;
}

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    // Dans Next.js 14+, les paramètres peuvent être une promesse
    const params = context.params;
    const { courseId } = params;
    
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
    const course = await Course.findById(courseId).lean() as CourseDocument | null;
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // S'assurer que course.quizzes est un tableau
    if (!course.quizzes || !Array.isArray(course.quizzes)) {
      return NextResponse.json(
        [],
        { status: 200 }
      );
    }
    
    // Format les quiz pour n'inclure que les informations nécessaires
    // et masquer les réponses correctes
    const formattedQuizzes = course.quizzes.map((quiz) => {
      return {
        _id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        isFinal: quiz.isFinal || false,
        passingScore: quiz.passingScore || 70,
        questions: Array.isArray(quiz.questions) ? quiz.questions.map((q) => ({
          _id: q._id ? q._id.toString() : undefined,
          question: q.question,
          // Ne pas inclure les réponses correctes ni les explications
          // Mais inclure le nombre d'options
          optionsCount: Array.isArray(q.options) ? q.options.length : 0
        })) : [],
      };
    });
    
    return NextResponse.json(formattedQuizzes);
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors du chargement des quiz' },
      { status: 500 }
    );
  }
}
