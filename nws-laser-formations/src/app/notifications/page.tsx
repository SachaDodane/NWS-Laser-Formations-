import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Notification from '@/models/Notification';
import NotificationsList from '@/components/notifications/NotificationsList';

export const metadata = {
  title: 'Mes notifications | NWS Laser Formations',
  description: 'Consultez toutes vos notifications',
};

async function getUserNotifications(userId: string) {
  await connectDB();
  
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  
  return notifications.map((notification: any) => ({
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
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const notifications = await getUserNotifications(session.user.id);
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Mes notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez et gérez vos notifications.
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <NotificationsList initialNotifications={notifications} />
        </div>
      </div>
    </div>
  );
}
