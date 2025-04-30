import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import User from '@/models/User';
import { Metadata } from 'next';
import { FadeIn } from '@/components/animations/MotionEffects';
import StripeCheckoutForm from '@/components/checkout/StripeCheckoutForm';

interface PageProps {
  params: {
    courseId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const course = await Course.findById(params.courseId).lean();
  
  if (!course) {
    return {
      title: 'Formation non trouvée | NWS Laser Formations',
      description: 'La formation demandée n\'existe pas',
    };
  }
  
  return {
    title: `Acheter ${course.title} | NWS Laser Formations`,
    description: `Achetez la formation "${course.title}" et développez vos compétences laser.`,
  };
}

async function getCourseAndUserStatus(courseId: string, userId: string | null) {
  await connectDB();
  
  // Get course
  const course = await Course.findById(courseId).lean();
  if (!course) return null;
  
  let hasPurchased = false;
  
  // Check if user has already purchased this course
  if (userId) {
    const user = await User.findById(userId).lean();
    if (user) {
      hasPurchased = user.courses && user.courses.some(
        (id: any) => id.toString() === courseId.toString()
      );
    }
  }
  
  // Determine image to use
  const localCourseImages = [
    "/images/courses/course-1.jpg",
    "/images/courses/course-2.jpg",
    "/images/courses/course-3.jpg",
    "/images/courses/course-4.jpg",
    "/images/courses/course-5.jpg",
  ];
  
  // Use course ID to get consistent image for the same course
  const charSum = course._id.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const imageIndex = charSum % localCourseImages.length;
  const imageToUse = course.image || localCourseImages[imageIndex];
  
  // Format course for frontend
  return {
    _id: course._id.toString(),
    title: course.title,
    description: course.description,
    price: course.price,
    image: imageToUse,
    chaptersCount: course.chapters?.length || 0,
    quizzesCount: course.quizzes?.length || 0,
    hasPurchased,
  };
}

export default async function CoursePurchasePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/login?callbackUrl=/courses/${params.courseId}/purchase`);
  }
  
  const courseData = await getCourseAndUserStatus(params.courseId, session.user.id);
  
  if (!courseData) {
    notFound();
  }
  
  // If user already has the course, redirect to course page
  if (courseData.hasPurchased) {
    redirect(`/courses/${params.courseId}`);
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-8">
            <Link
              href={`/courses/${params.courseId}`}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux détails de la formation
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Finaliser votre inscription
            </h1>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course details */}
          <FadeIn direction="right" delay={0.2}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={courseData.image}
                  alt={courseData.title}
                  fill
                  className="object-cover transform hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">
                      {courseData.title}
                    </h2>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="mt-4 text-gray-600">
                  {courseData.description}
                </p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-gray-600">{courseData.chaptersCount} chapitres</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-600">{courseData.quizzesCount} quiz</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-600">Certification incluse</span>
                  </div>
                </div>
                
                <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Prix</h3>
                      <p className="text-gray-600">Accès illimité à la formation</p>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">{courseData.price} €</span>
                  </div>
                </div>
                
                <div className="mt-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="text-green-800 font-medium">Ce que vous obtenez :</h4>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Accès à vie à tous les chapitres</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Quiz et exercices pratiques</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Certificat de fin de formation</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Support technique</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
          
          {/* Checkout form */}
          <FadeIn direction="left" delay={0.4}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Paiement sécurisé
                </h2>
                
                <StripeCheckoutForm
                  courseId={courseData._id}
                  courseTitle={courseData.title}
                  price={courseData.price}
                  userId={session.user.id}
                />
              </div>
            </div>
            
            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Questions fréquentes</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Comment accéder à ma formation après l'achat ?</h4>
                  <p className="text-gray-600 mt-1">Vous serez redirigé vers la page de la formation immédiatement après le paiement. Vous retrouverez également toutes vos formations dans la section "Mes formations".</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Combien de temps ai-je accès au contenu ?</h4>
                  <p className="text-gray-600 mt-1">L'accès est illimité dans le temps. Une fois achetée, la formation reste disponible dans votre espace personnel.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Les mises à jour sont-elles incluses ?</h4>
                  <p className="text-gray-600 mt-1">Oui, toutes les mises à jour futures de la formation seront accessibles sans coût supplémentaire.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
