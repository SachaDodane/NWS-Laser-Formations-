import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier si un admin avec cet email existe déjà
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      return NextResponse.json(
        { message: 'Un utilisateur administrateur avec cette adresse email existe déjà.' },
        { status: 409 }
      );
    }
    
    // Créer l'utilisateur administrateur
    const admin = await User.create({
      email: 'admin@gmail.com',
      password: 'adminadmin',  // Mot de passe plus long qui respecte la validation (min 6 caractères)
      name: 'Administrateur',
      role: 'admin',
    });
    
    return NextResponse.json(
      { 
        message: 'Utilisateur administrateur créé avec succès!',
        admin: {
          email: admin.email,
          name: admin.name,
          role: admin.role,
          _id: admin._id
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la création de l\'administrateur.' },
      { status: 500 }
    );
  }
}
