'use server';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';
import PromoCode from '@/models/PromoCode';
import Progress from '@/models/Progress';

// Server Action pour appliquer le code promo et rediriger
async function applyFreePromoCodeAction(courseId: string) {
  const session = await getServerSession(authOptions);
  
  // Rediriger vers login si non authentifié
  if (!session || !session.user || !session.user.id) {
    // Rediriger à travers l'action du serveur
    return { redirect: `/login?callbackUrl=/courses/${courseId}/apply-free-code` };
  }
  
  try {
    await connectDB();
    
    const userId = session.user.id;
    
    // Vérifier si l'utilisateur est déjà inscrit
    const user = await User.findById(userId).lean();
    if (!user) {
      return { redirect: `/courses/${courseId}/purchase?error=${encodeURIComponent("Utilisateur non trouvé")}` };
    }

    // Vérifier si l'utilisateur possède déjà ce cours
    const alreadyHasCourse = user.courses && user.courses.some(
      (id: any) => id.toString() === courseId
    );
    
    if (alreadyHasCourse) {
      return { redirect: `/my-courses/${courseId}` };
    }

    // Trouver un code promo gratuit valide pour ce cours
    const freePromoCodes = await PromoCode.find({
      $or: [
        { courseId: courseId, discount: 100 },
        { courseId: courseId, isFreePass: true },
        { courseId: null, discount: 100 },
        { courseId: null, isFreePass: true }
      ],
      isActive: true
    }).lean();
    
    if (!freePromoCodes || freePromoCodes.length === 0) {
      return {
        redirect: `/courses/${courseId}/purchase?error=${encodeURIComponent("Aucun code promo gratuit disponible")}`
      };
    }
    
    // Vérifier si l'utilisateur n'a pas déjà utilisé l'un de ces codes
    const availableCodes = freePromoCodes.filter(code => {
      const codeId = code._id ? code._id.toString() : "";
      return !user.usedPromoCodes || !user.usedPromoCodes.some((usedId: any) => 
        usedId && usedId.toString() === codeId
      );
    });
    
    if (!availableCodes || availableCodes.length === 0) {
      return {
        redirect: `/courses/${courseId}/purchase?error=${encodeURIComponent("Tous les codes promo disponibles ont déjà été utilisés")}`
      };
    }
    
    // Prendre le premier code disponible
    const codeToUse = availableCodes[0];
    
    // Vérifier si le cours existe
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { redirect: `/courses?error=${encodeURIComponent("Formation introuvable")}` };
    }
    
    // Mettre à jour l'utilisateur avec le cours et le code promo utilisé
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 
        courses: courseId,
        usedPromoCodes: codeToUse._id
      }
    });
    
    // Incrémenter le nombre d'utilisations du code promo
    await PromoCode.findByIdAndUpdate(codeToUse._id, {
      $inc: { currentUses: 1 }
    });
    
    // Créer une entrée de progression pour le cours avec des identifiants correctement sérialisés
    await Progress.create({
      userId: userId,
      courseId: courseId,
      completionPercentage: 0,
      chapterProgress: course.chapters ? course.chapters.map((chapter: any) => ({
        chapterId: chapter._id ? chapter._id.toString() : chapter._id,
        completed: false,
      })) : [],
      quizResults: [],
      startDate: new Date().toISOString(),
    });
    
    // Rediriger vers la page du cours
    return { redirect: `/my-courses/${courseId}` };
  } catch (error) {
    console.error("Erreur lors de l'application du code promo:", error);
    return { 
      redirect: `/courses/${courseId}/purchase?error=${encodeURIComponent("Une erreur est survenue lors de l'application du code promo")}`
    };
  }
}

// Cette fonction extractrice pour les paramètres est recommandée par Next.js 14+
function extractCourseId(params: { courseId: string }) {
  return params.courseId;
}

export default async function ApplyFreeCodePage({ params }: { params: { courseId: string } }) {
  // Utiliser la fonction extractrice pour éviter les avertissements de Next.js
  const courseId = extractCourseId(params);
  
  // Exécuter l'action serveur et récupérer le résultat
  const result = await applyFreePromoCodeAction(courseId);
  
  // Effectuer la redirection basée sur le résultat
  if (result && result.redirect) {
    redirect(result.redirect);
  }
  
  // Cette partie ne devrait jamais être atteinte car toutes les branches de l'action se terminent par une redirection
  return null;
}
