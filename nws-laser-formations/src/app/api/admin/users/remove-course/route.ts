import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
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
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Check if user has this course
    if (!user.courses.includes(courseId)) {
      return NextResponse.json(
        { message: 'L\'utilisateur ne possède pas cette formation' },
        { status: 400 }
      );
    }
    
    // Remove course from user
    user.courses = user.courses.filter(
      (course: any) => course.toString() !== courseId
    );
    await user.save();
    
    // Delete progress entry for the course
    await Progress.deleteOne({
      userId: userId,
      courseId: courseId,
    });
    
    // Redirect back to user detail page
    return NextResponse.redirect(new URL(`/admin/users/${userId}`, request.url));
  } catch (error: any) {
    console.error('Error removing course from user:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
