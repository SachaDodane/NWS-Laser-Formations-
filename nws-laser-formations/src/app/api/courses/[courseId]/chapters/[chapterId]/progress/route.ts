import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Progress from '@/models/Progress';
import Course from '@/models/Course';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  context: { params: { courseId: string; chapterId: string } }
) {
  try {
    // Récupérer les paramètres de manière sûre (Next.js 14+)
    const params = context.params;
    const { courseId, chapterId } = params;
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    
    await connectDB();
    
    const userId = session.user.id;
    
    // Vérifier si l'utilisateur existe et a accès à ce cours
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérification sécurisée que courses est un tableau et contient le cours
    if (!Array.isArray(user.courses) || !user.courses.some((id: any) => id && id.toString() === courseId)) {
      // L'utilisateur n'a pas encore accès au cours, on va créer l'accès
      // C'est peut-être une situation d'inscription en cours ou un cours gratuit
      console.log('Accès au cours non trouvé, création automatique...');
      
      // Mise à jour de l'utilisateur pour lui donner accès au cours
      await User.findByIdAndUpdate(userId, {
        $addToSet: { courses: courseId }
      });
    }
    
    // Créer ou récupérer la progression
    let progress = await Progress.findOne({ userId, courseId });
    
    // Si aucune progression n'existe, en créer une
    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        startDate: new Date(),
        lastAccessDate: new Date(),
        chapterProgress: [],
        quizResults: [],
        completionPercentage: 0,
        isCompleted: false
      });
    }
    
    // Vérifier que chapterProgress est un tableau (sécurité)
    if (!Array.isArray(progress.chapterProgress)) {
      progress.chapterProgress = [];
    }
    
    // Mettre à jour la progression du chapitre
    const chapterProgressIndex = progress.chapterProgress.findIndex(
      (cp: any) => cp && cp.chapterId && cp.chapterId.toString() === chapterId
    );
    
    if (chapterProgressIndex === -1) {
      // Si ce chapitre n'est pas encore dans la progression, l'ajouter
      progress.chapterProgress.push({
        chapterId,
        completed: true,
        lastAccessDate: new Date(),
      });
    } else {
      // Sinon, le mettre à jour
      progress.chapterProgress[chapterProgressIndex].completed = true;
      progress.chapterProgress[chapterProgressIndex].lastAccessDate = new Date();
    }
    
    // Mettre à jour la date du dernier accès
    progress.lastAccessDate = new Date();
    
    // Récupérer le cours pour calculer le pourcentage de progression
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // S'assurer que les chapitres existent
    if (!Array.isArray(course.chapters) || course.chapters.length === 0) {
      return NextResponse.json(
        { message: 'Aucun chapitre trouvé pour cette formation' },
        { status: 404 }
      );
    }
    
    // Calculer le pourcentage de progression
    const totalChapters = course.chapters.length;
    
    // Compter uniquement les chapitres uniques complétés
    // Création d'un Set pour éviter les doublons
    const uniqueCompletedChapterIds = new Set();
    progress.chapterProgress.forEach((cp: any) => {
      if (cp && cp.completed && cp.chapterId) {
        uniqueCompletedChapterIds.add(cp.chapterId.toString());
      }
    });
    
    const completedChapters = uniqueCompletedChapterIds.size;
    const completionPercentage = Math.min(100, Math.round((completedChapters / totalChapters) * 100));
    
    progress.completionPercentage = completionPercentage;
    
    // Vérifier si tous les chapitres sont terminés et tous les quiz sont réussis
    const allChaptersCompleted = uniqueCompletedChapterIds.size === totalChapters;
    
    // S'assurer que les quizzes existent
    if (Array.isArray(course.quizzes)) {
      const finalQuiz = course.quizzes.find((quiz: any) => quiz && quiz.isFinal);
      
      if (finalQuiz) {
        // Vérifier que quizResults est un tableau (sécurité)
        if (!Array.isArray(progress.quizResults)) {
          progress.quizResults = [];
        }
        
        const finalQuizResult = progress.quizResults.find(
          (qr: any) => qr && qr.quizId && qr.quizId.toString() === finalQuiz._id.toString() && qr.passed
        );
        
        if (allChaptersCompleted && finalQuizResult) {
          progress.isCompleted = true;
        }
      } else if (allChaptersCompleted) {
        // S'il n'y a pas de quiz final, marquer comme terminé quand tous les chapitres sont faits
        progress.isCompleted = true;
      }
    } else if (allChaptersCompleted) {
      // S'il n'y a pas de quizzes du tout, marquer comme terminé quand tous les chapitres sont faits
      progress.isCompleted = true;
    }
    
    await progress.save();
    
    return NextResponse.json({
      message: 'Chapitre terminé avec succès',
      completionPercentage,
      isCompleted: progress.isCompleted,
    });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors du marquage du chapitre' },
      { status: 500 }
    );
  }
}
