import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    await connectDB();
    
    // Build query
    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Format response
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      courseId: notification.courseId ? notification.courseId.toString() : null,
      quizId: notification.quizId,
      certificateId: notification.certificateId,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      createdAt: notification.createdAt.toISOString(),
    }));
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// Create new notification (for testing only, normally notifications are created by the system)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const notificationData = await request.json();
    
    // Validate required fields
    if (!notificationData.userId || !notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { message: 'userId, title et message sont requis' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create notification
    const notification = await Notification.create({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      courseId: notificationData.courseId || null,
      quizId: notificationData.quizId || null,
      certificateId: notificationData.certificateId || null,
      actionUrl: notificationData.actionUrl || null,
      actionLabel: notificationData.actionLabel || null,
    });
    
    return NextResponse.json({
      message: 'Notification créée avec succès',
      _id: notification._id.toString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de la création de la notification' },
      { status: 500 }
    );
  }
}
