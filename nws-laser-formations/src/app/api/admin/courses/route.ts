import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(
      courses.map(course => ({
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        price: course.price,
        imageUrl: course.imageUrl,
        chaptersCount: course.chapters.length,
        quizzesCount: course.quizzes.length,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('Error fetching courses for admin:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const courseData = await request.json();
    
    // Validate required fields
    if (!courseData.title || !courseData.description || courseData.price === undefined) {
      return NextResponse.json(
        { message: 'Titre, description et prix sont requis' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create new course
    const course = await Course.create({
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      imageUrl: courseData.imageUrl || '',
      chapters: courseData.chapters || [],
      quizzes: courseData.quizzes || [],
    });
    
    return NextResponse.json({
      message: 'Formation créée avec succès',
      _id: course._id.toString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la création de la formation' },
      { status: 500 }
    );
  }
}
