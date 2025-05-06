// Fonction pour calculer la progression incluant les quiz avec le même coefficient que les chapitres
// À utiliser dans src\app\api\courses\[courseId]\chapters\[chapterId]\progress\route.ts

export function calculateProgressWithQuizzes(progress: any, course: any) {
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

  // NOUVELLE PARTIE: Intégrer les quiz dans le calcul de progression
  let totalQuizzes = 0;
  let completedQuizzes = 0;

  if (Array.isArray(course.quizzes) && course.quizzes.length > 0) {
    totalQuizzes = course.quizzes.length;
    
    // Vérifier que quizResults est un tableau (sécurité)
    if (Array.isArray(progress.quizResults)) {
      // Pour chaque quiz, vérifier s'il a été réussi
      course.quizzes.forEach((quiz: any) => {
        if (quiz && quiz._id) {
          const quizId = quiz._id.toString();
          const quizResult = progress.quizResults.find(
            (qr: any) => qr && qr.quizId && qr.quizId.toString() === quizId && qr.passed
          );
          
          if (quizResult) {
            completedQuizzes++;
          }
        }
      });
    }
  }

  // Calcul du pourcentage avec chapitres et quiz ayant le même coefficient
  const totalItems = totalChapters + totalQuizzes;
  const completedItems = completedChapters + completedQuizzes;

  // Éviter les divisions par zéro
  const completionPercentage = totalItems > 0 
    ? Math.min(100, Math.round((completedItems / totalItems) * 100))
    : 0;

  // Mettre à jour l'objet progress
  const updatedProgress = { ...progress, completionPercentage };

  // Vérifier si tous les chapitres sont terminés et tous les quiz sont réussis
  const allChaptersCompleted = uniqueCompletedChapterIds.size === totalChapters;
  const allQuizzesCompleted = completedQuizzes === totalQuizzes;

  // S'assurer que les quizzes existent
  if (Array.isArray(course.quizzes) && course.quizzes.length > 0) {
    // Pour marquer le cours comme complété, tous les chapitres ET tous les quiz doivent être terminés
    if (allChaptersCompleted && allQuizzesCompleted) {
      updatedProgress.isCompleted = true;
    } else {
      updatedProgress.isCompleted = false;
    }
  } else {
    // S'il n'y a pas de quiz, utiliser seulement la complétion des chapitres
    updatedProgress.isCompleted = allChaptersCompleted;
  }

  return updatedProgress;
}
