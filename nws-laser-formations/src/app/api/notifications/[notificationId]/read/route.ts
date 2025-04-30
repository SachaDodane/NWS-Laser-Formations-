import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Notification from '@/models/Notification';

export async function POST(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    await connectDB();
    
    // Find notification
    const notification = await Notification.findById(params.notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { message: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    // Check if notification belongs to user
    if (notification.userId.toString() !== userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    // Mark as read
    notification.isRead = true;
    await notification.save();
    
    return NextResponse.json({
      message: 'Notification marquée comme lue',
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
