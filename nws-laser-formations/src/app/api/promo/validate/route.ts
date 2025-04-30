import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import PromoCode from '@/models/PromoCode';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

// Interface pour le type de PromoCode
interface IPromoCode {
  _id: mongoose.Types.ObjectId;
  code: string;
  discount: number;
  isFreePass: boolean;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  courseId: mongoose.Types.ObjectId | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { code, courseId } = await req.json();
    
    // Vérifier le code promo
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() }).lean() as unknown as IPromoCode;
    if (!promoCode || !promoCode.isActive) {
      return NextResponse.json(
        { error: 'Code promo invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Vérifier si le nombre maximum d'utilisations a été atteint
    if (promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Ce code promo a atteint son nombre maximum d\'utilisations' },
        { status: 400 }
      );
    }
    
    // Vérifier si le code est expiré
    if (promoCode.expiresAt && new Date() > new Date(promoCode.expiresAt)) {
      return NextResponse.json(
        { error: 'Ce code promo a expiré' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur a déjà utilisé ce code
    const user = await User.findById(session.user.id);
    if (user.usedPromoCodes.some((id: mongoose.Types.ObjectId) => id.toString() === promoCode._id.toString())) {
      return NextResponse.json(
        { error: 'Vous avez déjà utilisé ce code promo' },
        { status: 400 }
      );
    }
    
    // Déterminer le cours à ajouter
    let targetCourseId: mongoose.Types.ObjectId | string | null = null;
    
    // Si le code promo est associé à un cours spécifique, utiliser ce cours
    if (promoCode.courseId) {
      targetCourseId = promoCode.courseId;
    } 
    // Sinon, utiliser le courseId fourni dans la requête
    else if (courseId) {
      targetCourseId = courseId;
    } else {
      return NextResponse.json(
        { error: 'Aucun cours associé à ce code promo' },
        { status: 400 }
      );
    }
    
    // Récupérer le cours
    const course = await Course.findById(targetCourseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Cours associé introuvable' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur est déjà inscrit à ce cours
    if (user.courses.some((id: mongoose.Types.ObjectId) => id.toString() === course._id.toString())) {
      return NextResponse.json(
        { message: `Vous êtes déjà inscrit au cours "${course.title}"` }
      );
    }
    
    // Mettre à jour l'utilisateur
    user.courses.push(course._id);
    user.usedPromoCodes.push(promoCode._id);
    await user.save();
    
    // Incrémenter le nombre d'utilisations du code promo
    await PromoCode.findByIdAndUpdate(promoCode._id, {
      $inc: { currentUses: 1 }
    });
    
    // Créer une entrée de progression pour ce cours
    // 1. Vérifier si une entrée existe déjà
    let progressEntry = await Progress.findOne({
      userId: session.user.id,
      courseId: course._id
    });
    
    // 2. Si non, créer une nouvelle entrée
    if (!progressEntry) {
      // Initialiser la structure de progression
      // Créer un tableau chapterProgress pour chaque chapitre du cours
      const chapterProgress = course.chapters.map((chapter: any) => ({
        chapterId: chapter._id,
        completed: false,
        timeSpent: 0,
        lastAccessDate: null
      }));
      
      progressEntry = new Progress({
        userId: session.user.id,
        courseId: course._id,
        completionPercentage: 0,
        chapterProgress: chapterProgress,
        quizResults: [],
        startDate: new Date(),
        lastAccessDate: new Date()
      });
      
      await progressEntry.save();
    }
    
    return NextResponse.json({
      success: true,
      courseId: course._id,
      message: `Félicitations ! Vous avez débloqué le cours "${course.title}"`
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
