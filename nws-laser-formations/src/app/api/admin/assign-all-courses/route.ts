import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';

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

    // Récupérer toutes les formations
    const allCourses = await Course.find().select('_id');
    const courseIds = allCourses.map(course => course._id);

    // Mettre à jour l'utilisateur admin pour lui donner accès à toutes les formations
    // Filtrer les cours déjà présents pour éviter les doublons
    const existingCourseIds = adminUser.courses.map(id => id.toString());
    const newCourseIds = courseIds.filter(id => !existingCourseIds.includes(id.toString()));

    if (newCourseIds.length === 0) {
      return NextResponse.json(
        { message: 'L\'administrateur a déjà accès à toutes les formations.' },
        { status: 200 }
      );
    }

    // Ajouter les nouveaux cours
    adminUser.courses.push(...newCourseIds);
    await adminUser.save();

    return NextResponse.json(
      { 
        message: `${newCourseIds.length} formations ont été ajoutées à votre compte administrateur.`,
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
