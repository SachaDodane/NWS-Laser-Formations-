import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import PromoCode from '@/models/PromoCode';
import Course from '@/models/Course';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    const { code } = await req.json();
    
    // Vérifier le code promo
    const promoCode = await PromoCode.findOne({ code }).lean();
    if (!promoCode || !promoCode.isActive) {
      return NextResponse.json(
        { error: 'Code promo invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur a déjà utilisé ce code
    const user = await User.findById(session.user.id);
    if (user.usedPromoCodes.includes(promoCode._id)) {
      return NextResponse.json(
        { error: 'Vous avez déjà utilisé ce code promo' },
        { status: 400 }
      );
    }
    
    // Ajouter le cours à l'utilisateur
    const course = await Course.findById(promoCode.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Cours associé introuvable' },
        { status: 404 }
      );
    }
    
    // Mettre à jour l'utilisateur
    user.courses.push(course._id);
    user.usedPromoCodes.push(promoCode._id);
    await user.save();
    
    return NextResponse.json({
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
