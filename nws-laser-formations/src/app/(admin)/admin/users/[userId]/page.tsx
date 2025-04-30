import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';

interface PageProps {
  params: {
    userId: string;
  };
}

async function getUserWithData(userId: string) {
  await connectDB();
  
  // Get user
  const user = await User.findById(userId).lean();
  if (!user) return null;
  
  // Get courses this user has purchased
  let userCourses = [];
  if (user.courses && user.courses.length > 0) {
    userCourses = await Course.find({
      _id: { $in: user.courses }
    }).lean();
  }
  
  // Get progress for each course
  const progressRecords = await Progress.find({
    userId: user._id
  }).lean();
  
  // Format user data
  const formattedUser = {
    _id: user._id.toString(),
    name: user.name || '',
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A',
  };
  
  // Format courses with progress
  const formattedCourses = userCourses.map(course => {
    const courseProgress = progressRecords.find(
      p => p.courseId.toString() === course._id.toString()
    );
    
    // Convert all _id fields and subfields to string
    return {
      _id: course._id.toString(),
      title: course.title,
      price: course.price,
      progress: courseProgress ? {
        completionPercentage: courseProgress.completionPercentage,
        isCompleted: courseProgress.isCompleted,
        startDate: new Date(courseProgress.startDate).toLocaleDateString(),
        lastAccessDate: new Date(courseProgress.lastAccessDate).toLocaleDateString(),
        certificate: courseProgress.certificate ? {
          issuedDate: new Date(courseProgress.certificate.issuedDate).toLocaleDateString(),
          certificateUrl: courseProgress.certificate.certificateUrl,
        } : null,
        _id: courseProgress._id ? courseProgress._id.toString() : undefined,
        userId: courseProgress.userId ? courseProgress.userId.toString() : undefined,
        courseId: courseProgress.courseId ? courseProgress.courseId.toString() : undefined,
      } : null,
    };
  });
  
  return {
    user: formattedUser,
    courses: formattedCourses,
  };
}

async function getAvailableCourses(userCourses: any[]) {
  await connectDB();
  
  // Get IDs of courses the user already has
  const userCourseIds = userCourses.map(course => course._id);
  
  // Find courses the user doesn't have yet
  const availableCourses = await Course.find({
    _id: { $nin: userCourseIds }
  }).select('_id title price').lean();
  
  return availableCourses.map(course => ({
    _id: course._id.toString(),
    title: course.title,
    price: course.price,
  }));
}

export default async function UserDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  const userData = await getUserWithData(params.userId);
  
  if (!userData) {
    notFound();
  }
  
  const { user, courses } = userData;
  const availableCourses = await getAvailableCourses(courses);
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la liste des utilisateurs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Détails utilisateur
          </h1>
        </div>
        
        {/* User info card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Informations utilisateur</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900">{user.name || 'Nom non défini'}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date d'inscription</h4>
                <p className="mt-1 text-md text-gray-900">{user.createdAt}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Dernière connexion</h4>
                <p className="mt-1 text-md text-gray-900">{user.lastLogin}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <form action="/api/admin/users/toggle-role" method="POST">
                <input type="hidden" name="userId" value={user._id} />
                <button
                  type="submit"
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {user.role === 'admin' ? 'Rétrograder au rôle Utilisateur' : 'Promouvoir au rôle Administrateur'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* User's courses */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Formations de l'utilisateur</h2>
            
            {availableCourses.length > 0 && (
              <div className="relative">
                <form action="/api/admin/users/add-course" method="POST" className="flex">
                  <input type="hidden" name="userId" value={user._id} />
                  <select
                    name="courseId"
                    className="block w-64 bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Sélectionner une formation...</option>
                    {availableCourses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title} - {course.price} €
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {courses.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              Cet utilisateur n'a pas encore acheté de formation.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.map(course => (
                <li key={course._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-600 mr-4">Prix: {course.price} €</span>
                        
                        {course.progress && (
                          <>
                            <div className="flex items-center">
                              <div className="mr-2 w-20 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${course.progress.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{course.progress.completionPercentage}%</span>
                            </div>
                            
                            {course.progress.isCompleted && (
                              <span className="ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Terminée
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      
                      {course.progress && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Commencé le {course.progress.startDate}</span>
                          <span className="mx-2">•</span>
                          <span>Dernier accès le {course.progress.lastAccessDate}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {course.progress && course.progress.certificate && (
                        <a
                          href={course.progress.certificate.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-4 text-green-600 hover:text-green-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Certificat
                        </a>
                      )}
                      
                      <form action="/api/admin/users/remove-course" method="POST" onSubmit={() => confirm('Êtes-vous sûr de vouloir retirer cette formation ?')}>
                        <input type="hidden" name="userId" value={user._id} />
                        <input type="hidden" name="courseId" value={course._id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Retirer
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
