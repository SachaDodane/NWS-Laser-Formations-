import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import PromoCode from '@/models/PromoCode';

export async function GET(
  request: NextRequest,
  { params }: { params: { promoCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const promoCode = await PromoCode.findById(params.promoCodeId);
    
    if (!promoCode) {
      return NextResponse.json(
        { message: 'Code promo non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      _id: promoCode._id.toString(),
      code: promoCode.code,
      discount: promoCode.discount,
      isFreePass: promoCode.isFreePass || false,
      maxUses: promoCode.maxUses,
      currentUses: promoCode.currentUses || 0,
      isActive: promoCode.isActive,
      expiresAt: promoCode.expiresAt,
      createdAt: promoCode.createdAt,
      updatedAt: promoCode.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { promoCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const updateData = await request.json();
    
    await connectDB();
    
    const promoCode = await PromoCode.findById(params.promoCodeId);
    
    if (!promoCode) {
      return NextResponse.json(
        { message: 'Code promo non trouvé' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (updateData.code !== undefined) {
      // Check if the new code already exists
      if (updateData.code !== promoCode.code) {
        const existingCode = await PromoCode.findOne({ code: updateData.code.toUpperCase() });
        if (existingCode) {
          return NextResponse.json(
            { message: 'Ce code promo existe déjà' },
            { status: 400 }
          );
        }
        promoCode.code = updateData.code.toUpperCase();
      }
    }
    
    if (updateData.discount !== undefined) {
      // Validate discount is between 0 and 100
      if (updateData.discount < 0 || updateData.discount > 100) {
        return NextResponse.json(
          { message: 'La réduction doit être entre 0 et 100%' },
          { status: 400 }
        );
      }
      promoCode.discount = updateData.discount;
    }
    
    if (updateData.isFreePass !== undefined) {
      promoCode.isFreePass = updateData.isFreePass;
      // Force discount to 100% for free pass
      if (updateData.isFreePass) {
        promoCode.discount = 100;
      }
    }
    
    if (updateData.maxUses !== undefined) {
      promoCode.maxUses = updateData.maxUses;
    }
    
    if (updateData.isActive !== undefined) {
      promoCode.isActive = updateData.isActive;
    }
    
    if (updateData.expiresAt !== undefined) {
      promoCode.expiresAt = updateData.expiresAt;
    }
    
    await promoCode.save();
    
    return NextResponse.json({
      message: 'Code promo mis à jour avec succès',
      _id: promoCode._id.toString(),
    });
  } catch (error: any) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la mise à jour du code promo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { promoCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const promoCode = await PromoCode.findById(params.promoCodeId);
    
    if (!promoCode) {
      return NextResponse.json(
        { message: 'Code promo non trouvé' },
        { status: 404 }
      );
    }
    
    await PromoCode.deleteOne({ _id: params.promoCodeId });
    
    return NextResponse.json({
      message: 'Code promo supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la suppression du code promo' },
      { status: 500 }
    );
  }
}
