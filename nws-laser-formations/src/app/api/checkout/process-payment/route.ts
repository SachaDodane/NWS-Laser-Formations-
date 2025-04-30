import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { userId, courseId, paymentDetails } = await request.json();
    
    // Verify user identity
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé à effectuer ce paiement' },
        { status: 403 }
      );
    }
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { message: 'ID utilisateur et ID formation sont requis' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Get user and course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // Check if user already has this course
    if (user.courses.includes(courseId)) {
      return NextResponse.json(
        { message: 'Vous possédez déjà cette formation' },
        { status: 400 }
      );
    }
    
    // This is a mock implementation of Stripe payment processing
    // In a real app, this would interact with the Stripe API
    
    // Simulate payment processing
    const paymentSuccessful = true; // Always succeed in this mock implementation
    
    if (!paymentSuccessful) {
      return NextResponse.json(
        { message: 'Le paiement a échoué. Veuillez réessayer.' },
        { status: 400 }
      );
    }
    
    // Add course to user's purchased courses
    user.courses.push(courseId);
    await user.save();
    
    // Create initial progress record
    await Progress.create({
      userId,
      courseId,
      startDate: new Date(),
      lastAccessDate: new Date(),
      completedChapters: [],
      completedQuizzes: [],
      quizResults: [],
      completionPercentage: 0,
      isCompleted: false,
    });
    
    // Log the purchase (in a real app, this would be stored in a transactions table)
    console.log(`User ${userId} purchased course ${courseId} for ${paymentDetails.amount}€`);
    
    return NextResponse.json({
      success: true,
      message: 'Paiement traité avec succès',
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors du traitement du paiement' },
      { status: 500 }
    );
  }
}
