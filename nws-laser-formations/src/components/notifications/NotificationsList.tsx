'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  courseId: string | null;
  quizId: string | null;
  certificateId: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
}

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export default function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(
    initialNotifications.filter(n => !n.isRead).length
  );
  
  const router = useRouter();
  
  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    // Get all unread notification IDs
    const unreadIds = notifications
      .filter(notification => !notification.isRead)
      .map(notification => notification._id);
    
    if (unreadIds.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Mark each notification as read
      await Promise.all(
        unreadIds.map(id => 
          fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
          })
        )
      );
      
      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true,
      })));
      
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError('Erreur lors du marquage de toutes les notifications comme lues');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage de la notification comme lue');
      }
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };
  
  // Format date (client-safe)
  const formatDate = (dateString: string) => {
    try {
      if (typeof window === 'undefined') return dateString;
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Group notifications by date (client-safe)
  const groupedNotifications = notifications.reduce<{ [date: string]: Notification[] }>((groups, notification) => {
    let date = notification.createdAt;
    if (typeof window !== 'undefined') {
      try {
        date = new Date(notification.createdAt).toLocaleDateString('fr-FR');
      } catch {}
    }
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});
  
  return (
    <div>
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Toutes les notifications</h2>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </>
            ) : (
              'Tout marquer comme lu'
            )}
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="py-8 px-6 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune notification</h3>
          <p className="mt-1">Vous n'avez aucune notification pour le moment.</p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date} className="py-4 px-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">{date}</h3>
              
              <ul className="space-y-4">
                {dateNotifications.map((notification) => (
                  <li 
                    key={notification._id}
                    className={`relative p-4 rounded-lg transition duration-150 cursor-pointer border ${
                      notification.isRead 
                        ? 'border-gray-200 hover:bg-gray-50' 
                        : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 ml-4">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        
                        {notification.actionUrl && notification.actionLabel && (
                          <div className="mt-2">
                            <Link
                              href={notification.actionUrl}
                              className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!notification.isRead) {
                                  markAsRead(notification._id);
                                }
                              }}
                            >
                              {notification.actionLabel}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
