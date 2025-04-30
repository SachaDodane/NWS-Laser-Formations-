import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import { FadeIn } from '@/components/animations/MotionEffects';

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  try {
    await connectDB();
    const course = await Course.findById(params.courseId).lean();
    
    if (!course) {
      return {
        title: 'Formation non trouvée | NWS Laser Formations',
        description: 'Cette formation n\'existe pas ou n\'est plus disponible.'
      };
    }
    
    return {
      title: `${course.title} | NWS Laser Formations`,
      description: course.description || 'Découvrez cette formation professionnelle de NWS Laser.',
    };
  } catch (error) {
    return {
      title: 'Erreur | NWS Laser Formations',
      description: 'Une erreur est survenue lors du chargement de cette page.'
    };
  }
}

async function getCourseDetails(courseId: string, userId?: string) {
  try {
    await connectDB();
    
    // Get course details
    const course = await Course.findById(courseId).lean();
    
    if (!course) {
      return null;
    }
    
    // Check if user is enrolled
    let isEnrolled = false;
    let progress = null;
    
    if (userId) {
      progress = await Progress.findOne({ userId, courseId }).lean();
      isEnrolled = !!progress;
    }
    
    // Serialize for client
    const serializedCourse = {
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
      chapters: course.chapters ? course.chapters.map((chapter: any) => ({
        ...chapter,
        _id: chapter._id ? chapter._id.toString() : undefined
      })) : [],
      quizzes: course.quizzes ? course.quizzes.map((quiz: any) => ({
        ...quiz,
        _id: quiz._id ? quiz._id.toString() : undefined,
        questions: quiz.questions ? quiz.questions.map((question: any) => ({
          ...question,
          _id: question._id ? question._id.toString() : undefined
        })) : []
      })) : []
    };
    
    // Free preview chapter (first chapter content or special preview content)
    const previewChapter = serializedCourse.chapters.length > 0 ? serializedCourse.chapters[0] : null;
    
    return {
      course: serializedCourse,
      isEnrolled,
      progress: progress ? {
        ...progress,
        _id: progress._id.toString(),
        userId: progress.userId.toString(),
        courseId: progress.courseId.toString(),
        completionPercentage: progress.completionPercentage || 0,
      } : null,
      previewChapter,
    };
  } catch (error) {
    console.error("Error fetching course details:", error);
    return null;
  }
}

// Liste de compétences associées à chaque formation - à définir dynamiquement plus tard via la DB
const skillsByIndex: Record<number, string[]> = {
  0: ["Maîtrise des équipements laser", "Techniques de découpe de précision", "Paramétrage avancé de machines"],
  1: ["Normes de sécurité ISO", "Protocoles de protection individuelle", "Gestion des risques en milieu laser"],
  2: ["Découpe de matériaux complexes", "Optimisation des paramètres de découpe", "Techniques d'assemblage"],
  3: ["Gravure sur métaux précieux", "Techniques de marquage sur verre", "Finitions de surface professionnelles"],
  4: ["Certification européenne ELI", "Réglementation française", "Qualification opérateur laser niveau 2"]
};

export default async function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  const data = await getCourseDetails(params.courseId, session?.user?.id);
  
  if (!data) {
    notFound();
  }
  
  const { course, isEnrolled, progress, previewChapter } = data;
  
  // Générer un index basé sur l'ID du cours pour récupérer des compétences
  const charSum = course._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const skillsIndex = charSum % 5; // 5 ensembles de compétences
  const relatedSkills = skillsByIndex[skillsIndex] || skillsByIndex[0];
  
  // Images de secours locales
  const localCourseImages = [
    "/images/courses/course-1.jpg",
    "/images/courses/course-2.jpg",
    "/images/courses/course-3.jpg",
    "/images/courses/course-4.jpg",
    "/images/courses/course-5.jpg",
  ];
  
  // Déterminer l'image à utiliser
  const imageIndex = charSum % localCourseImages.length;
  const imageToUse = course.image || localCourseImages[imageIndex];
  
  return (
    <div className="bg-white min-h-screen">
      {/* Section Hero avec image de couverture */}
      <div className="relative h-80 bg-blue-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-800/70 to-blue-900/90"></div>
          <Image
            src={imageToUse}
            alt={course.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {course.title}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              {course.description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Informations principales et aperçu */}
          <div className="md:col-span-2">
            <FadeIn direction="up">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de cette formation</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    {course.description}
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mt-6">Ce que vous allez apprendre</h3>
                  <ul className="mt-4 space-y-2">
                    {relatedSkills.map((skill, index) => (
                      <li key={index} className="flex items-start">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        <span className="text-gray-700">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
            
            {/* Aperçu du cours */}
            <FadeIn direction="up" delay={0.1}>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçu du contenu</h2>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
                  {previewChapter ? (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{previewChapter.title}</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-600">{previewChapter.content.substring(0, 300)}...</p>
                      </div>
                      <div className="mt-4">
                        <div className="text-blue-600 font-medium">
                          {isEnrolled ? (
                            <Link href={`/my-courses/${course._id}/chapters/${previewChapter._id}`} className="flex items-center hover:underline">
                              <span>Continuer l'apprentissage</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          ) : (
                            <span>Accédez à ce chapitre et plus en vous inscrivant à cette formation</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun aperçu disponible pour le moment.</p>
                  )}
                </div>
              </div>
            </FadeIn>
            
            {/* Plan de cours */}
            <FadeIn direction="up" delay={0.2}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Programme de la formation</h2>
                <div className="space-y-4">
                  {course.chapters.map((chapter, index) => (
                    <div key={chapter._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                          {index === 0 ? (
                            <p className="text-sm text-blue-600 mt-1">Aperçu gratuit disponible</p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">{isEnrolled ? 'Disponible' : 'Accès après inscription'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
          
          {/* Carte d'inscription et détails */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden sticky top-24">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={imageToUse}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{course.price} €</span>
                  {isEnrolled && (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">Inscrit</span>
                  )}
                </div>
                
                {isEnrolled ? (
                  <Link
                    href={`/my-courses/${course._id}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continuer la formation
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${course._id}/purchase`}
                    className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    S'inscrire à la formation
                  </Link>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Cette formation inclut :</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{course.chapters.length} chapitres de formation</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-gray-600">Certificat d'achèvement</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">Accès illimité</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-gray-600">Quiz interactifs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
