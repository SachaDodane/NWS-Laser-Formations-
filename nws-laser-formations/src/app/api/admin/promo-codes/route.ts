import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import PromoCode from '@/models/PromoCode';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(
      promoCodes.map(code => ({
        _id: code._id.toString(),
        code: code.code,
        discount: code.discount,
        isFreePass: code.isFreePass || false,
        maxUses: code.maxUses,
        currentUses: code.currentUses || 0,
        isActive: code.isActive,
        expiresAt: code.expiresAt,
        courseId: code.courseId || null,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
      }))
    );
  } catch (error: any) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const promoCodeData = await request.json();
    
    // Validate required fields
    if (!promoCodeData.code || promoCodeData.discount === undefined || promoCodeData.maxUses === undefined) {
      return NextResponse.json(
        { message: 'Code, réduction et nombre d\'utilisations maximum sont requis' },
        { status: 400 }
      );
    }
    
    // Validate discount is between 0 and 100
    if (promoCodeData.discount < 0 || promoCodeData.discount > 100) {
      return NextResponse.json(
        { message: 'La réduction doit être entre 0 et 100%' },
        { status: 400 }
      );
    }
    
    // Force discount to 100% for free pass
    if (promoCodeData.isFreePass) {
      promoCodeData.discount = 100;
    }
    
    await connectDB();
    
    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: promoCodeData.code.toUpperCase() });
    if (existingCode) {
      return NextResponse.json(
        { message: 'Ce code promo existe déjà' },
        { status: 400 }
      );
    }
    
    // Create new promo code
    const promoCode = await PromoCode.create({
      code: promoCodeData.code.toUpperCase(),
      discount: promoCodeData.discount,
      isFreePass: promoCodeData.isFreePass || false,
      maxUses: promoCodeData.maxUses,
      isActive: promoCodeData.isActive !== undefined ? promoCodeData.isActive : true,
      courseId: promoCodeData.courseId || null,
      expiresAt: promoCodeData.expiresAt || null,
    });
    
    return NextResponse.json({
      message: 'Code promo créé avec succès',
      _id: promoCode._id.toString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la création du code promo' },
      { status: 500 }
    );
  }
}
