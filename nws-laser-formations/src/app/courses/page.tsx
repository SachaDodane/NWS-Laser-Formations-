import { Metadata } from 'next';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import CourseCard from '@/components/CourseCard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import Progress from '@/models/Progress';

export const metadata: Metadata = {
  title: 'Toutes les formations | NWS Laser Formations',
  description: 'Découvrez notre catalogue complet de formations laser en ligne',
};

async function getCourses(userId?: string) {
  await connectDB();
  
  // Get all courses
  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  
  // If user is logged in, get their progress for each course
  if (userId) {
    const progress = await Progress.find({ userId }).lean();
    
    return courses.map(course => {
      const courseProgress = progress.find(p => p.courseId.toString() === course._id.toString());
      
      // Sérialiser correctement tous les IDs MongoDB (ObjectId)
      const serializedCourse = {
        ...course,
        _id: course._id.toString(),
        createdAt: course.createdAt ? course.createdAt.toISOString() : null,
        updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
        chapters: course.chapters ? course.chapters.map(chapter => ({
          ...chapter,
          _id: chapter._id ? chapter._id.toString() : undefined
        })) : [],
        quizzes: course.quizzes ? course.quizzes.map(quiz => ({
          ...quiz,
          _id: quiz._id ? quiz._id.toString() : undefined,
          questions: quiz.questions ? quiz.questions.map(question => ({
            ...question,
            _id: question._id ? question._id.toString() : undefined
          })) : []
        })) : []
      };
      
      return {
        ...serializedCourse,
        progress: courseProgress ? {
          ...courseProgress,
          _id: courseProgress._id.toString(),
          userId: courseProgress.userId.toString(),
          courseId: courseProgress.courseId.toString(),
          chapterProgress: courseProgress.chapterProgress ? courseProgress.chapterProgress.map(cp => ({
            ...cp,
            _id: cp._id ? cp._id.toString() : undefined,
            chapterId: cp.chapterId ? cp.chapterId.toString() : undefined
          })) : []
        } : undefined,
      };
    });
  }
  
  // Format for client - sérialiser correctement tous les IDs
  return courses.map(course => {
    return {
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
      chapters: course.chapters ? course.chapters.map(chapter => ({
        ...chapter,
        _id: chapter._id ? chapter._id.toString() : undefined
      })) : [],
      quizzes: course.quizzes ? course.quizzes.map(quiz => ({
        ...quiz,
        _id: quiz._id ? quiz._id.toString() : undefined,
        questions: quiz.questions ? quiz.questions.map(question => ({
          ...question,
          _id: question._id ? question._id.toString() : undefined
        })) : []
      })) : []
    };
  });
}

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const courses = await getCourses(session?.user?.id);
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Catalogue des formations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos formations laser professionnelles et développez vos compétences.
          </p>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Aucune formation disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard 
                key={course._id} 
                course={course} 
                progress={course.progress}
                showProgress={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
