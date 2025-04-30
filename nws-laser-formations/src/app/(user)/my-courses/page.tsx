import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import CourseCard from '@/components/CourseCard';
import PromoCodeInput from '@/components/PromoCodeInput';

export const metadata = {
  title: 'Mes formations | NWS Laser Formations',
  description: 'Accédez à vos formations achetées et suivez votre progression',
};

async function getUserCourses(userId: string) {
  await connectDB();
  
  // Find user with their purchased courses
  const user = await User.findById(userId).lean();
  
  if (!user || !user.courses.length) {
    return [];
  }
  
  // Get the courses details
  const courses = await Course.find({
    _id: { $in: user.courses },
  }).lean();
  
  // Get progress for each course
  const progress = await Progress.find({
    userId,
    courseId: { $in: user.courses },
  }).lean();
  
  // Format for client
  return courses.map(course => {
    const courseProgress = progress.find(
      p => p.courseId.toString() === course._id.toString()
    );
    
    return {
      ...JSON.parse(JSON.stringify(course)),
      _id: course._id.toString(),
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
      chapters: course.chapters ? course.chapters.map((chapter: any) => ({
        ...JSON.parse(JSON.stringify(chapter)),
        _id: chapter._id.toString()
      })) : [],
      quizzes: course.quizzes ? course.quizzes.map((quiz: any) => ({
        ...JSON.parse(JSON.stringify(quiz)),
        _id: quiz._id.toString()
      })) : [],
      progress: courseProgress ? {
        ...JSON.parse(JSON.stringify(courseProgress)),
        _id: courseProgress._id.toString(),
        userId: courseProgress.userId.toString(),
        courseId: courseProgress.courseId.toString(),
        chapterProgress: courseProgress.chapterProgress ? courseProgress.chapterProgress.map((cp: any) => ({
          ...JSON.parse(JSON.stringify(cp)),
          _id: cp._id ? cp._id.toString() : undefined,
          chapterId: cp.chapterId ? cp.chapterId.toString() : undefined
        })) : []
      } : undefined,
    };
  });
}

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const courses = await getUserCourses(session.user.id);
  
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mes formations
          </h1>
          <p className="text-gray-600">
            Suivez votre progression et continuez votre apprentissage
          </p>
        </div>
        
        <PromoCodeInput />
        
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Vous n'avez pas encore de formations</h3>
            <p className="text-gray-600 mb-6">
              Parcourez notre catalogue et inscrivez-vous à votre première formation
            </p>
            <a
              href="/courses"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Voir le catalogue
            </a>
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
