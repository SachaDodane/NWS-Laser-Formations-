import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import Link from 'next/link';
import CertificateButton from '@/components/CertificateButton';

interface PageProps {
  params: {
    courseId: string;
  };
}

async function getCourseWithProgress(courseId: string, userId: string) {
  await connectDB();
  
  // Get the course
  const course = await Course.findById(courseId).lean();
  
  if (!course) {
    return null;
  }
  
  // Get the user's progress for this course
  const progress = await Progress.findOne({
    userId,
    courseId,
  }).lean();
  
  if (!progress) {
    return null;
  }
  
  // Format for client
  return {
    course: {
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      chapters: course.chapters.map((chapter: any) => ({
        ...chapter,
        _id: chapter._id.toString(),
        videos: chapter.videos ? chapter.videos.map((video: any) => ({
          ...video,
          _id: video._id ? video._id.toString() : undefined
        })) : [],
        resources: chapter.resources ? chapter.resources.map((resource: any) => ({
          ...resource,
          _id: resource._id ? resource._id.toString() : undefined
        })) : []
      })),
      quizzes: course.quizzes.map((quiz: any) => ({
        ...quiz,
        _id: quiz._id.toString(),
        questions: quiz.questions ? quiz.questions.map((question: any) => ({
          ...question,
          _id: question._id ? question._id.toString() : undefined,
          options: question.options ? question.options.map((option: any) => ({
            ...option,
            _id: option._id ? option._id.toString() : undefined
          })) : []
        })) : []
      })),
    },
    progress: {
      ...progress,
      _id: progress._id.toString(),
      userId: progress.userId.toString(),
      courseId: progress.courseId.toString(),
      chapterProgress: progress.chapterProgress.map((cp: any) => ({
        ...cp,
        _id: cp._id ? cp._id.toString() : undefined,
        chapterId: cp.chapterId ? cp.chapterId.toString() : undefined,
        lastAccessDate: cp.lastAccessDate ? new Date(cp.lastAccessDate).toISOString() : undefined
      })),
      quizResults: progress.quizResults.map((qr: any) => ({
        ...qr,
        _id: qr._id ? qr._id.toString() : undefined,
        quizId: qr.quizId ? qr.quizId.toString() : undefined,
        submittedAt: qr.submittedAt ? new Date(qr.submittedAt).toISOString() : undefined
      })),
      startDate: progress.startDate ? new Date(progress.startDate).toISOString() : undefined,
      lastAccessDate: progress.lastAccessDate ? new Date(progress.lastAccessDate).toISOString() : undefined,
      certificate: progress.certificate ? {
        ...progress.certificate,
        issuedDate: progress.certificate.issuedDate ? new Date(progress.certificate.issuedDate).toISOString() : undefined
      } : null
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const data = await getCourseWithProgress(params.courseId, session.user.id);
  
  if (!data) {
    notFound();
  }
  
  const { course, progress } = data;
  
  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {course.title}
          </h1>
          <div className="flex items-center mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {progress.completionPercentage}% complété
            </span>
          </div>
          <p className="text-gray-700 mb-4">{course.description}</p>
          
          {progress.completionPercentage === 100 ? (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Formation complétée !</h3>
              <p className="text-green-700 mb-4">
                Félicitations ! Vous avez terminé cette formation avec succès. 
                Vous pouvez maintenant télécharger votre certificat.
              </p>
              <CertificateButton 
                courseId={course._id}
                courseTitle={course.title}
                userName={session.user.name || "Étudiant"}
                completionDate={new Date().toLocaleDateString('fr-FR')}
              />
            </div>
          ) : progress.completionPercentage > 0 ? (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-700">
                Continuez votre progression pour obtenir votre certificat une fois la formation complétée à 100%.
              </p>
            </div>
          ) : null}
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Chapitres</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  {sortedChapters.map((chapter, index) => {
                    const chapterProgress = progress.chapterProgress.find(
                      cp => cp.chapterId === chapter._id
                    );
                    const isCompleted = chapterProgress?.completed || false;
                    
                    return (
                      <li key={chapter._id}>
                        <Link
                          href={`/my-courses/${params.courseId}/chapters/${chapter._id}`}
                          className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isCompleted ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-md font-semibold text-gray-900">{chapter.title}</h3>
                            {chapter.videoUrl && (
                              <span className="text-xs text-gray-500 flex items-center mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Inclut une vidéo
                              </span>
                            )}
                          </div>
                          <div className="ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Quiz et évaluations</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  {course.quizzes.map((quiz) => {
                    const quizResult = progress.quizResults.find(
                      qr => qr.quizId === quiz._id
                    );
                    const status = quizResult
                      ? quizResult.passed
                        ? 'success'
                        : 'failed'
                      : 'pending';
                    
                    return (
                      <li key={quiz._id}>
                        <Link
                          href={`/my-courses/${params.courseId}/quizzes/${quiz._id}`}
                          className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                            status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {status === 'success' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : status === 'failed' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-md font-semibold text-gray-900">{quiz.title}</h3>
                            <span className="text-xs text-gray-500 flex items-center mt-1">
                              {quiz.isFinal ? 'Quiz final' : 'Quiz intermédiaire'} • {quiz.questions.length} questions
                            </span>
                          </div>
                          {quizResult && (
                            <div className="ml-auto text-right">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                quizResult.passed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {quizResult.score}%
                              </span>
                              {!quiz.isFinal || (quiz.isFinal && !quizResult.passed) ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  {quizResult.attempts} tentative(s)
                                </p>
                              ) : null}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
