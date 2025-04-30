import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string; chapterId: string } }
) {
  try {
    // Dans Next.js 14+, les paramètres peuvent être une promesse
    const params = context.params;
    const { courseId, chapterId } = params;
    
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
    
    // Vérifier si course.chapters est un tableau
    if (!Array.isArray(course.chapters)) {
      return NextResponse.json(
        { message: 'Format de chapitre invalide' },
        { status: 500 }
      );
    }
    
    // Find the chapter
    const chapter = course.chapters.find((c: any) => c._id && c._id.toString() === chapterId);
    if (!chapter) {
      return NextResponse.json(
        { message: 'Chapitre non trouvé' },
        { status: 404 }
      );
    }
    
    // Find previous and next chapters
    const chapters = [...course.chapters].sort((a: any, b: any) => a.order - b.order);
    const currentIndex = chapters.findIndex((c: any) => c._id && c._id.toString() === chapterId);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
    
    // Format response data
    const formatChapter = (chapter: any) => ({
      _id: chapter._id.toString(),
      title: chapter.title,
      content: chapter.content,
      videoUrl: chapter.videoUrl,
      order: chapter.order || 0,
      resources: chapter.resources ? chapter.resources.map((resource: any) => ({
        _id: resource._id ? resource._id.toString() : undefined,
        title: resource.title,
        url: resource.url,
        type: resource.type
      })) : []
    });
    
    const formatCourse = (course: any) => ({
      _id: course._id.toString(),
      title: course.title,
      chapters: Array.isArray(course.chapters) ? course.chapters.map((ch: any) => ({
        _id: ch._id ? ch._id.toString() : undefined,
        title: ch.title,
        order: ch.order || 0
      })) : [],
      quizzes: Array.isArray(course.quizzes) ? course.quizzes.map((quiz: any) => ({
        _id: quiz._id ? quiz._id.toString() : undefined,
        title: quiz.title,
        isFinal: quiz.isFinal || false,
      })) : [],
    });
    
    return NextResponse.json({
      chapter: formatChapter(chapter),
      course: formatCourse(course),
      prevChapter: prevChapter ? formatChapter(prevChapter) : null,
      nextChapter: nextChapter ? formatChapter(nextChapter) : null,
    });
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
