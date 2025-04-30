import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import CourseForm from '@/components/admin/CourseForm';

export const metadata = {
  title: 'Nouvelle formation | NWS Laser Formations',
  description: 'Créer une nouvelle formation',
};

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/courses"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux formations
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Créer une nouvelle formation
          </h1>
          <p className="mt-2 text-gray-600">
            Remplissez les informations ci-dessous pour créer une nouvelle formation.
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <CourseForm />
        </div>
      </div>
    </div>
  );
}
