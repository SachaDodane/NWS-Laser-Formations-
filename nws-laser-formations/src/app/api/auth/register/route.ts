import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by the pre-save hook in the model)
    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password,
      role: 'user',
    });

    // Return success without sending the password
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user: userObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
