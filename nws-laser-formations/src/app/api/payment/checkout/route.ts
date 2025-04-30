import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This is a mock Stripe payment API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { message: 'ID de formation requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    // Check if user already owns this course
    if (user.courses.includes(courseId)) {
      return NextResponse.json(
        { message: 'Vous avez déjà acheté cette formation' },
        { status: 400 }
      );
    }

    // Mock successful payment process
    // In a real app, we would initiate a Stripe payment session here

    // Simuler une URL de paiement (pour corriger l'erreur "URL de paiement manquante")
    const paymentUrl = `/courses/${courseId}/purchase`;

    // Add course to user's purchased courses
    user.courses.push(courseId);
    await user.save();

    // Create progress tracking for the course
    const chapterProgress = course.chapters.map(chapter => ({
      chapterId: chapter._id,
      completed: false,
      lastAccessDate: new Date(),
    }));

    const progress = await Progress.create({
      userId: user._id,
      courseId: course._id,
      chapterProgress,
      startDate: new Date(),
      lastAccessDate: new Date(),
      completionPercentage: 0,
      isCompleted: false,
    });

    return NextResponse.json(
      { 
        message: 'Paiement réussi', 
        success: true,
        paymentId: 'mock_payment_' + Date.now(),
        progress,
        url: paymentUrl
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors du traitement du paiement' },
      { status: 500 }
    );
  }
}
