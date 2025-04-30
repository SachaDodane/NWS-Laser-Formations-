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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const courseId = formData.get('courseId') as string;
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { message: 'ID utilisateur et ID formation sont requis' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
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
        { message: 'L\'utilisateur possède déjà cette formation' },
        { status: 400 }
      );
    }
    
    // Add course to user
    user.courses.push(courseId);
    await user.save();
    
    // Create progress entry for the course
    await Progress.create({
      userId: userId,
      courseId: courseId,
      startDate: new Date(),
      lastAccessDate: new Date(),
      completedChapters: [],
      completedQuizzes: [],
      quizResults: [],
      completionPercentage: 0,
      isCompleted: false,
    });
    
    // Redirect back to user detail page
    return NextResponse.redirect(new URL(`/admin/users/${userId}`, request.url));
  } catch (error: any) {
    console.error('Error adding course to user:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
