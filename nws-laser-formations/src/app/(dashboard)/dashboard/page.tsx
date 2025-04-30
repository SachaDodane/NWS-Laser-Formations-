import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';

export const metadata = {
  title: 'Tableau de bord | NWS Laser Formations',
  description: 'Accédez à vos formations et suivez votre progression',
};

async function getUserCourses(userId: string) {
  await connectDB();
  
  // Get user with courses
  const user = await User.findById(userId).lean();
  if (!user || !user.courses || user.courses.length === 0) {
    return [];
  }
  
  // Get course details
  const courses = await Course.find({
    _id: { $in: user.courses }
  }).lean();
  
  // Get progress for each course
  const progressRecords = await Progress.find({
    userId,
    courseId: { $in: user.courses }
  }).lean();
  
  // Format courses with progress
  return courses.map(course => {
    const progress = progressRecords.find(
      p => p.courseId.toString() === course._id.toString()
    );
    
    return {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl || '',
      chaptersCount: course.chapters?.length || 0,
      progress: progress ? {
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isCompleted,
        lastAccessDate: progress.lastAccessDate ? new Date(progress.lastAccessDate).toLocaleDateString() : 'Jamais',
        certificate: progress.certificate || null,
      } : null,
    };
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const userCourses = await getUserCourses(session.user.id);
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Bienvenue, {session.user.name || session.user.email}. Voici vos formations en cours.
          </p>
        </div>
        
        {userCourses.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Vous n'avez encore aucune formation</h3>
            <p className="mt-1 text-gray-500">
              Découvrez nos formations laser et commencez votre apprentissage dès aujourd'hui.
            </p>
            <div className="mt-6">
              <Link
                href="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Découvrir les formations
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Mes formations</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {userCourses.map((course) => (
                  <li key={course._id} className="relative">
                    <div className="p-6 flex items-center">
                      <div className="flex-shrink-0 h-16 w-24 bg-blue-100 rounded-md overflow-hidden">
                        {course.imageUrl ? (
                          <Image
                            src={course.imageUrl}
                            alt={course.title}
                            width={96}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600">
                            <span className="text-white text-xs font-medium">
                              {course.title.substring(0, 10)}...
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {course.description}
                        </p>
                        
                        {course.progress && (
                          <div className="mt-2">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${course.progress.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {course.progress.completionPercentage}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Dernier accès : {course.progress.lastAccessDate}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        {course.progress?.isCompleted ? (
                          <div className="flex items-center space-x-4">
                            {course.progress.certificate && (
                              <a
                                href={course.progress.certificate.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Certificat
                              </a>
                            )}
                            
                            <Link
                              href={`/courses/${course._id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Revoir
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/courses/${course._id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Continuer
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {course.progress?.isCompleted && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Terminé
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Statistiques d'apprentissage</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-3xl font-bold text-blue-700">
                    {userCourses.length}
                  </span>
                  <p className="mt-1 text-sm text-gray-600">Formation(s) total(es)</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-3xl font-bold text-green-700">
                    {userCourses.filter(c => c.progress?.isCompleted).length}
                  </span>
                  <p className="mt-1 text-sm text-gray-600">Formation(s) terminée(s)</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <span className="text-3xl font-bold text-yellow-700">
                    {userCourses.filter(c => c.progress?.certificate).length}
                  </span>
                  <p className="mt-1 text-sm text-gray-600">Certificat(s) obtenu(s)</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center my-8">
              <Link
                href="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Découvrir plus de formations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
