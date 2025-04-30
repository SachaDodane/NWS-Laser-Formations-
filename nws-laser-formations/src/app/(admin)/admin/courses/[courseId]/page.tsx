'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import CourseFormFields from '@/components/admin/CourseFormFields';
import ChapterManager from '@/components/admin/ChapterManager';
import QuizManager from '@/components/admin/QuizManager';
import DownloadCourseImage from '@/components/admin/DownloadCourseImage';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isNewCourse = params.courseId === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    image: '',
    chapters: [],
    quizzes: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && !isNewCourse) {
      fetchCourse();
    } else if (status === 'authenticated' && isNewCourse) {
      setLoading(false);
    }
  }, [status, params.courseId]);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/courses/${params.courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Erreur lors du chargement de la formation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const handleChaptersChange = (chapters: any[]) => {
    setCourse({
      ...course,
      chapters
    });
  };
  
  const handleQuizzesChange = (quizzes: any[]) => {
    setCourse({
      ...course,
      quizzes
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!course.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!course.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (!course.price) {
      newErrors.price = 'Le prix est requis';
    } else if (isNaN(Number(course.price)) || Number(course.price) < 0) {
      newErrors.price = 'Le prix doit être un nombre positif';
    }
    
    if (course.imageUrl && !isValidUrl(course.imageUrl)) {
      newErrors.imageUrl = 'L\'URL de l\'image n\'est pas valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/admin/courses' + (isNewCourse ? '' : `/${params.courseId}`), {
        method: isNewCourse ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...course,
          price: Number(course.price),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'enregistrement de la formation');
      }
      
      toast.success(isNewCourse ? 'Formation créée avec succès' : 'Formation mise à jour avec succès');
      
      if (isNewCourse) {
        const data = await response.json();
        router.push(`/admin/courses/${data._id}`);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'administration
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {isNewCourse ? 'Créer une nouvelle formation' : 'Modifier la formation'}
            </h1>
          </div>
          
          {!isNewCourse && (
            <Link
              href={`/admin/courses/${params.courseId}/preview`}
              target="_blank"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Aperçu
            </Link>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course details section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
              <p className="text-sm text-gray-500 mt-1">
                Les informations de base de votre formation.
              </p>
            </div>
            <div className="px-6 py-6">
              <CourseFormFields 
                values={{
                  title: course.title,
                  description: course.description,
                  price: course.price,
                  imageUrl: course.imageUrl
                }}
                errors={errors}
                onChange={handleChange}
              />
              
              {/* Ajout du composant pour télécharger l'image du cours */}
              {!isNewCourse && (
                <DownloadCourseImage 
                  courseId={params.courseId}
                  currentImageUrl={course.image}
                  onImageDownloaded={(newImagePath) => {
                    setCourse({
                      ...course,
                      image: newImagePath
                    });
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Chapters section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Contenu de la formation</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les chapitres et le contenu de votre formation.
              </p>
            </div>
            <div className="px-6 py-6">
              <ChapterManager
                chapters={course.chapters}
                onChange={handleChaptersChange}
              />
            </div>
          </div>
          
          {/* Quizzes section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quiz et évaluations</h2>
              <p className="text-sm text-gray-500 mt-1">
                Créez des quiz pour évaluer les connaissances des apprenants.
              </p>
            </div>
            <div className="px-6 py-6">
              <QuizManager
                quizzes={course.quizzes}
                onChange={handleQuizzesChange}
              />
            </div>
          </div>
          
          {/* Form actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 ${
                saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                'Enregistrer la formation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
