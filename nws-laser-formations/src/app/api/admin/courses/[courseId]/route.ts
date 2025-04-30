import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // Format course data for the frontend
    const formattedCourse = {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      price: course.price,
      imageUrl: course.imageUrl || '',
      image: course.image || '',
      chapters: course.chapters.map((chapter: any) => ({
        _id: chapter._id.toString(),
        title: chapter.title,
        content: chapter.content,
        videoUrl: chapter.videoUrl,
        order: chapter.order,
      })),
      quizzes: course.quizzes.map((quiz: any) => ({
        _id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description || '',
        isFinal: quiz.isFinal,
        passingScore: quiz.passingScore,
        questions: quiz.questions.map((question: any) => ({
          _id: question._id.toString(),
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
        })),
      })),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formattedCourse);
  } catch (error: any) {
    console.error('Error fetching course for admin:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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
    
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // Update course data
    course.title = courseData.title;
    course.description = courseData.description;
    course.price = courseData.price;
    course.imageUrl = courseData.imageUrl || '';
    
    // Add support for local image path
    if (courseData.image) {
      course.image = courseData.image;
    }
    
    // Handle chapters
    if (courseData.chapters) {
      // Remove all existing chapters and replace with new ones
      course.chapters = [];
      
      courseData.chapters.forEach((chapter: any) => {
        course.chapters.push({
          title: chapter.title,
          content: chapter.content,
          videoUrl: chapter.videoUrl,
          order: chapter.order,
        });
      });
    }
    
    // Handle quizzes
    if (courseData.quizzes) {
      // Remove all existing quizzes and replace with new ones
      course.quizzes = [];
      
      courseData.quizzes.forEach((quiz: any) => {
        const quizQuestions = quiz.questions.map((question: any) => ({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
        }));
        
        course.quizzes.push({
          title: quiz.title,
          description: quiz.description || '',
          isFinal: quiz.isFinal,
          passingScore: quiz.passingScore,
          questions: quizQuestions,
        });
      });
    }
    
    await course.save();
    
    return NextResponse.json({
      message: 'Formation mise à jour avec succès',
      _id: course._id.toString(),
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la mise à jour de la formation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    await Course.deleteOne({ _id: params.courseId });
    
    return NextResponse.json({
      message: 'Formation supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la suppression de la formation' },
      { status: 500 }
    );
  }
}
