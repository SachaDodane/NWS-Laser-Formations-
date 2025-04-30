import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé. Seuls les administrateurs peuvent effectuer cette action.' },
        { status: 401 }
      );
    }

    await connectDB();

    // Récupérer l'utilisateur admin
    const adminUser = await User.findById(session.user.id);
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Utilisateur administrateur non trouvé.' },
        { status: 404 }
      );
    }

    // Récupérer toutes les formations avec chapitres pour créer les progressions
    const allCourses = await Course.find();
    
    // Convertir les IDs de cours déjà associés à l'administrateur en chaînes de caractères pour faciliter la comparaison
    const existingCourseIds = adminUser.courses.map((id: any) => id.toString());
    
    // Filtrer les nouveaux cours
    const newCourses = allCourses.filter(course => !existingCourseIds.includes(course._id.toString()));

    if (newCourses.length === 0) {
      return NextResponse.json(
        { message: 'L\'administrateur a déjà accès à toutes les formations.' },
        { status: 200 }
      );
    }

    // Tableau pour stocker les promesses de création des progressions
    const progressPromises = [];
    const newCourseIds = [];

    // Pour chaque nouvelle formation
    for (const course of newCourses) {
      // Ajouter l'ID du cours à la liste des IDs
      newCourseIds.push(course._id);
      
      // Calculer le nombre total de chapitres pour le pourcentage de progression
      const totalChapters = course.chapters.length;
      
      // Créer un objet de progression avec tous les chapitres marqués comme complétés
      const chapterProgress = course.chapters.map((chapter: any) => ({
        chapterId: chapter._id,
        isCompleted: true,
        completedAt: new Date()
      }));
      
      // Créer une entrée de progression
      const progressPromise = Progress.create({
        userId: adminUser._id,
        courseId: course._id,
        completionPercentage: totalChapters > 0 ? 100 : 0, // 100% si au moins un chapitre, sinon 0%
        isCompleted: totalChapters > 0, // Complété si au moins un chapitre
        chapterProgress: chapterProgress,
        quizResults: [], // Pas de résultats de quiz pour l'administrateur
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        completedAt: totalChapters > 0 ? new Date() : null, // Date de complétion si la formation est considérée complétée
      });
      
      progressPromises.push(progressPromise);
    }

    // Ajouter les nouveaux cours à l'administrateur
    adminUser.courses.push(...newCourseIds);
    await adminUser.save();
    
    // Attendre que toutes les progressions soient créées
    await Promise.all(progressPromises);

    return NextResponse.json(
      { 
        message: `${newCourseIds.length} formations ont été ajoutées à votre compte administrateur avec un accès complet.`,
        coursesAdded: newCourseIds.length
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de l\'attribution des formations:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de l\'attribution des formations.' },
      { status: 500 }
    );
  }
}
