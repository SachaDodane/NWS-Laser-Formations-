import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Aperçu de formation | NWS Laser Formations',
  description: 'Prévisualisation de formation pour les administrateurs',
};

async function getCourse(courseId: string) {
  await connectDB();
  
  const course = await Course.findById(courseId).lean();
  
  if (!course) {
    return null;
  }
  
  return {
    _id: course._id.toString(),
    title: course.title,
    description: course.description,
    price: course.price,
    image: course.image,
    chapters: course.chapters.map((chapter: any) => ({
      _id: chapter._id.toString(),
      title: chapter.title,
      content: chapter.content,
      videoUrl: chapter.videoUrl,
      imageUrl: chapter.imageUrl,
      order: chapter.order,
    })),
    quizzes: course.quizzes.map((quiz: any) => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      questions: quiz.questions.map((question: any) => ({
        _id: question._id.toString(),
        text: question.text,
        options: question.options,
        correctOption: question.correctOption,
      })),
    })),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

export default async function CoursePreviewPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  const course = await getCourse(params.courseId);
  
  if (!course) {
    redirect('/admin/courses');
  }
  
  // Utiliser une image locale si l'image du cours n'existe pas
  const localCourseImages = [
    "/images/courses/course-1.jpg",
    "/images/courses/course-2.jpg",
    "/images/courses/course-3.jpg",
    "/images/courses/course-4.jpg",
    "/images/courses/course-5.jpg",
  ];
  
  const courseImage = course.image || localCourseImages[0];
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Aperçu de la formation
            </h1>
            <p className="text-gray-600 mt-1">
              Prévisualisation de la formation comme elle apparaîtra aux utilisateurs
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={`/admin/courses/${course._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Éditer la formation
            </Link>
            <Link
              href="/admin/courses"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
        
        {/* Header section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <Image 
              src={courseImage}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="text-white">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <div className="flex items-center mt-2">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                    {course.price}€
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700">{course.description}</p>
          </div>
        </div>
        
        {/* Chapters section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Chapitres</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {course.chapters.length > 0 ? (
              course.chapters
                .sort((a: any, b: any) => a.order - b.order)
                .map((chapter: any, index: number) => (
                  <div key={chapter._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {chapter.content?.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Aucun chapitre disponible pour cette formation.
              </div>
            )}
          </div>
        </div>
        
        {/* Quizzes section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quiz</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {course.quizzes.length > 0 ? (
              course.quizzes.map((quiz: any, index: number) => (
                <div key={quiz._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        Q{index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Aucun quiz disponible pour cette formation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
