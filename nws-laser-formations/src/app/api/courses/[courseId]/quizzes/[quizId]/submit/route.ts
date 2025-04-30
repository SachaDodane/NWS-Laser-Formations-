import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { score, passed } = await request.json();
    
    if (typeof score !== 'number' || typeof passed !== 'boolean') {
      return NextResponse.json(
        { message: 'Score et statut de réussite requis' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if user has access to this course
    const user = await User.findById(session.user.id);
    if (!user || !user.courses.some((id) => id.toString() === params.courseId)) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas accès à cette formation' },
        { status: 403 }
      );
    }
    
    // Get the course
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // Find the quiz
    const quiz = course.quizzes.id(params.quizId);
    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz non trouvé' },
        { status: 404 }
      );
    }
    
    // Get user's progress for this course
    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId: params.courseId,
    });
    
    if (!progress) {
      return NextResponse.json(
        { message: 'Progression non trouvée' },
        { status: 404 }
      );
    }
    
    // Update quiz result
    const quizResultIndex = progress.quizResults.findIndex(
      (result) => result.quizId.toString() === params.quizId
    );
    
    if (quizResultIndex === -1) {
      // First attempt
      progress.quizResults.push({
        quizId: params.quizId,
        score,
        passed,
        attempts: 1,
        lastAttemptDate: new Date(),
      });
    } else {
      // Update existing result
      progress.quizResults[quizResultIndex].score = score;
      progress.quizResults[quizResultIndex].passed = passed;
      progress.quizResults[quizResultIndex].attempts += 1;
      progress.quizResults[quizResultIndex].lastAttemptDate = new Date();
    }
    
    // If this is the final quiz and the user passed with score >= 80%
    let certificate = null;
    if (quiz.isFinal && passed && score >= 80) {
      // Check if all chapters have been completed
      const allChaptersCompleted = course.chapters.every((chapter) => {
        const chapterProgress = progress.chapterProgress.find(
          (cp) => cp.chapterId.toString() === chapter._id.toString()
        );
        return chapterProgress && chapterProgress.completed;
      });
      
      if (allChaptersCompleted) {
        // Generate certificate
        const certificateUrl = await generateCertificate(
          user.name || user.email.split('@')[0],
          course.title,
          session.user.id,
          params.courseId
        );
        
        // Update progress with certificate
        progress.certificate = {
          issuedDate: new Date(),
          certificateUrl,
        };
        
        // Mark course as completed
        progress.isCompleted = true;
        
        certificate = {
          issuedDate: progress.certificate.issuedDate.toISOString(),
          certificateUrl: progress.certificate.certificateUrl,
        };
      }
    }
    
    await progress.save();
    
    return NextResponse.json({
      message: 'Quiz soumis avec succès',
      score,
      passed,
      certificate,
    });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

async function generateCertificate(
  userName: string,
  courseTitle: string,
  userId: string,
  courseId: string
): Promise<string> {
  // In a real app, we would generate a PDF certificate using a library like PDFKit
  // For this demo, we'll just create a mock certificate URL
  const certificateId = `${userId}-${courseId}-${Date.now()}`;
  const certificateUrl = `/api/certificates/${certificateId}`;
  
  return certificateUrl;
}
