import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Progress from '@/models/Progress';
import Course from '@/models/Course';
import User from '@/models/User';
import { generateCertificatePDF } from '@/lib/pdf/generateCertificate';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Extraire et valider les données de la requête
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      return NextResponse.json(
        { message: 'Format de requête invalide' },
        { status: 400 }
      );
    }
    
    const { userId, courseId, quizId, answers } = body;
    
    // Vérifier l'identité de l'utilisateur
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé à soumettre ce quiz' },
        { status: 403 }
      );
    }
    
    // Validation des paramètres obligatoires
    if (!userId || !courseId || !quizId) {
      return NextResponse.json(
        { message: 'Paramètres manquants: userId, courseId ou quizId' },
        { status: 400 }
      );
    }
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { message: 'Réponses manquantes ou format invalide' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer le cours pour vérifier que le quiz existe et obtenir les réponses correctes
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }
    
    // S'assurer que le tableau de quizzes existe
    if (!Array.isArray(course.quizzes) || course.quizzes.length === 0) {
      return NextResponse.json(
        { message: 'Aucun quiz disponible pour cette formation' },
        { status: 404 }
      );
    }
    
    // Trouver le quiz dans le cours
    const quiz = course.quizzes.find(
      (q: any) => q && q._id && q._id.toString() === quizId
    );
    
    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz non trouvé' },
        { status: 404 }
      );
    }
    
    // S'assurer que le tableau de questions existe
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return NextResponse.json(
        { message: 'Aucune question disponible pour ce quiz' },
        { status: 400 }
      );
    }
    
    // Vérifier que toutes les questions sont répondues
    if (answers.length !== quiz.questions.length) {
      return NextResponse.json({
        message: `Toutes les questions doivent être répondues (${answers.length}/${quiz.questions.length})`,
        answered: answers.length,
        total: quiz.questions.length
      }, { status: 400 });
    }
    
    // Évaluer les réponses
    let correctAnswers = 0;
    const feedback = [];
    
    for (const answer of answers) {
      const { questionId, answerIndex } = answer;
      
      if (questionId === undefined || answerIndex === undefined) {
        return NextResponse.json(
          { message: 'Format de réponse invalide: questionId et answerIndex sont requis' },
          { status: 400 }
        );
      }
      
      // Trouver la question
      const question = quiz.questions.find(
        (q: any) => q && q._id && q._id.toString() === questionId
      );
      
      if (!question) {
        return NextResponse.json(
          { message: `Question non trouvée: ${questionId}` },
          { status: 400 }
        );
      }
      
      // S'assurer que l'index de la réponse correcte existe
      if (question.correctAnswer === undefined) {
        return NextResponse.json(
          { message: `Réponse correcte non définie pour la question: ${questionId}` },
          { status: 500 }
        );
      }
      
      const isCorrect = parseInt(answerIndex) === parseInt(question.correctAnswer);
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      feedback.push({
        questionId,
        isCorrect,
        correctAnswerIndex: question.correctAnswer,
        explanation: question.explanation || undefined,
      });
    }
    
    // Calculer le score
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const isPassed = score >= quiz.passingScore;
    
    // Récupérer ou créer la progression
    let progress = await Progress.findOne({
      userId,
      courseId,
    });
    
    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        startDate: new Date(),
        lastAccessDate: new Date(),
        chapterProgress: [],
        quizResults: [],
        completionPercentage: 0,
        isCompleted: false,
      });
    }
    
    // S'assurer que les arrays existent
    if (!Array.isArray(progress.quizResults)) {
      progress.quizResults = [];
    }
    
    // Mettre à jour la date du dernier accès
    progress.lastAccessDate = new Date();
    
    // Vérifier si le quiz est déjà complété
    const quizResultIndex = progress.quizResults.findIndex(
      (result: any) => result && result.quizId && result.quizId.toString() === quizId
    );
    
    // Mettre à jour le résultat du quiz
    const quizResult = {
      quizId,
      score,
      isPassed,
      attemptDate: new Date(),
    };
    
    if (quizResultIndex >= 0) {
      progress.quizResults[quizResultIndex] = quizResult;
    } else {
      progress.quizResults.push(quizResult);
    }
    
    // S'assurer que le tableau de chapitres existe
    if (!Array.isArray(course.chapters)) {
      course.chapters = [];
    }
    
    // Utiliser chapterProgress au lieu de completedChapters pour la cohérence
    const completedChapters = Array.isArray(progress.chapterProgress) 
      ? progress.chapterProgress.filter((cp: any) => cp && cp.completed).length
      : 0;
    
    // Calculer le pourcentage de complétion
    const totalItems = course.chapters.length + course.quizzes.length;
    const completedItems = completedChapters + progress.quizResults.filter((qr: any) => qr && qr.isPassed).length;
    
    // Éviter la division par zéro
    progress.completionPercentage = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100)
      : 0;
    
    // Vérifier si tous les chapitres et quiz sont complétés
    const allChaptersCompleted = course.chapters.length > 0 && completedChapters === course.chapters.length;
    
    const allQuizzesPassed = course.quizzes.length > 0 && 
      course.quizzes.every((q: any) => {
        if (!q || !q._id) return false;
        const result = progress.quizResults.find((r: any) => r && r.quizId && r.quizId.toString() === q._id.toString());
        return result && result.isPassed;
      });
    
    // Marquer le cours comme terminé si tout est fait
    if (allChaptersCompleted && allQuizzesPassed) {
      progress.isCompleted = true;
    }
    
    // Générer un certificat si le quiz final est réussi et que le certificat n'existe pas encore
    let certificateUrl = null;
    
    if (isPassed && quiz.isFinal && !progress.certificate) {
      try {
        // Récupérer le nom de l'utilisateur depuis la session
        const userName = user.name || session.user.name || session.user.email || 'Apprenant';
        
        // Générer un ID de certificat unique
        const certificateId = `${userId}-${courseId}-${Date.now()}`;
        
        // Générer le certificat
        certificateUrl = await generateCertificatePDF({
          userName,
          courseTitle: course.title || 'Formation',
          completionDate: new Date(),
          userEmail: user.email || session.user.email || '',
          certificateId,
        });
        
        // Sauvegarder les détails du certificat dans la progression
        progress.certificate = {
          certificateId,
          issuedDate: new Date(),
          certificateUrl,
        };
      } catch (certError) {
        console.error('Erreur lors de la génération du certificat:', certError);
        // Continuer même si la génération du certificat échoue
      }
    }
    
    await progress.save();
    
    return NextResponse.json({
      score,
      isPassed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      feedback,
      passingScore: quiz.passingScore,
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
      certificateUrl
    });
  } catch (error: any) {
    console.error('Erreur lors de la soumission du quiz:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la soumission du quiz' },
      { status: 500 }
    );
  }
}
