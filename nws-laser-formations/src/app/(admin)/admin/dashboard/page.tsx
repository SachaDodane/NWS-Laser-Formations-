import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import PromoCode from '@/models/PromoCode';
import AdminStatCards from '@/components/admin/AdminStatCards';
import AdminCharts from '@/components/admin/AdminCharts';

export const metadata = {
  title: 'Tableau de bord administrateur | NWS Laser Formations',
  description: 'Analytics et statistiques de la plateforme NWS Laser Formations',
};

async function getStats() {
  await connectDB();
  
  // Basic stats
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalCompletions = await Progress.countDocuments({ isCompleted: true });
  const totalCertificates = await Progress.countDocuments({ 'certificate': { $ne: null } });
  
  // Recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email createdAt')
    .lean();
  
  // Popular courses (most enrolled)
  const popularCourses = await Course.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'courses',
        as: 'enrolledUsers'
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        price: 1,
        enrollmentCount: { $size: '$enrolledUsers' },
      }
    },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 5 }
  ]);
  
  // Active promo codes
  const activeCodes = await PromoCode.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  
  // Chart data - enrollments over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const enrollmentData = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Format chart data
  const formattedEnrollmentData = enrollmentData.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
    count: item.count
  }));
  
  // Create data for all days in the last 30 days
  const allDaysData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dateString = date.toISOString().split('T')[0];
    const existingData = formattedEnrollmentData.find(item => item.date === dateString);
    
    allDaysData.unshift({
      date: dateString,
      count: existingData ? existingData.count : 0
    });
  }
  
  // Most active users (most completed courses)
  const activeUsers = await Progress.aggregate([
    { $match: { isCompleted: true } },
    {
      $group: {
        _id: '$userId',
        completedCount: { $sum: 1 }
      }
    },
    { $sort: { completedCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        _id: 1,
        completedCount: 1,
        user: { $arrayElemAt: ['$user', 0] }
      }
    }
  ]);
  
  return {
    stats: {
      totalUsers,
      totalCourses,
      totalCompletions,
      totalCertificates,
    },
    recentUsers: recentUsers.map(user => ({
      _id: user._id.toString(),
      name: user.name || 'Utilisateur',
      email: user.email,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    })),
    popularCourses: popularCourses.map(course => ({
      _id: course._id.toString(),
      title: course.title,
      price: course.price,
      enrollmentCount: course.enrollmentCount,
    })),
    activeCodes: activeCodes.map(code => ({
      _id: code._id.toString(),
      code: code.code,
      discount: code.discount,
      isFreePass: code.isFreePass || false,
      uses: `${code.currentUses}/${code.maxUses}`,
    })),
    enrollmentChartData: allDaysData,
    activeUsers: activeUsers.map(item => ({
      _id: item._id.toString(),
      name: item.user.name || 'Utilisateur',
      email: item.user.email,
      completedCount: item.completedCount,
    })),
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  const {
    stats,
    recentUsers,
    popularCourses,
    activeCodes,
    enrollmentChartData,
    activeUsers,
  } = await getStats();
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenue dans le panneau d'administration de NWS Laser Formations.
          </p>
        </div>
        
        {/* Statistics Cards */}
        <AdminStatCards stats={stats} />
        
        {/* Charts */}
        <div className="mt-8">
          <AdminCharts enrollmentChartData={enrollmentChartData} />
        </div>
        
        {/* Dashboard Widgets */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Utilisateurs récents</h2>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Voir tous
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentUsers.length > 0 ? (
                recentUsers.map(user => (
                  <div key={user._id} className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Utilisateur'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      <div className="ml-auto text-sm text-gray-500">
                        Inscription: {user.createdAt}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  Aucun utilisateur récent
                </div>
              )}
            </div>
          </div>
          
          {/* Popular Courses */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Formations populaires</h2>
              <Link
                href="/admin/courses"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Voir toutes
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {popularCourses.length > 0 ? (
                popularCourses.map(course => (
                  <div key={course._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.price} €
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {course.enrollmentCount} inscrit{course.enrollmentCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  Aucune formation disponible
                </div>
              )}
            </div>
          </div>
          
          {/* Active Promo Codes */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Codes promo actifs</h2>
              <Link
                href="/admin/promo-codes"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Gérer
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {activeCodes.length > 0 ? (
                activeCodes.map(code => (
                  <div key={code._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {code.code}
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-4">
                          Utilisations: {code.uses}
                        </div>
                        {code.isFreePass ? (
                          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            Accès gratuit
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {code.discount}% de réduction
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  Aucun code promo actif
                </div>
              )}
            </div>
          </div>
          
          {/* Most Active Users */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Utilisateurs les plus actifs</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activeUsers.length > 0 ? (
                activeUsers.map(user => (
                  <div key={user._id} className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Utilisateur'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      <div className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {user.completedCount} formation{user.completedCount > 1 ? 's' : ''} terminée{user.completedCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  Aucun utilisateur actif
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/courses/new"
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Nouvelle formation
                  </div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/admin/promo-codes"
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Créer code promo
                  </div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/admin/users"
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Gérer utilisateurs
                  </div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/courses"
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              target="_blank"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Voir le site
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
