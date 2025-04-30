'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import React from 'react';

interface ChapterPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

// Fonction utilitaire pour convertir les URLs YouTube en URLs d'embed
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Si l'URL est déjà au format embed, la retourner telle quelle
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Formats possibles: 
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  let videoId = '';
  
  if (url.includes('youtube.com/watch')) {
    const urlObj = new URL(url);
    videoId = urlObj.searchParams.get('v') || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1]?.split('?')[0] || '';
  }
  
  if (!videoId) return url; // Si on ne peut pas extraire l'ID, retourner l'URL d'origine
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
};

export default function ChapterPage({ params }: ChapterPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [nextChapter, setNextChapter] = useState<any>(null);
  const [prevChapter, setPrevChapter] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  
  // Utiliser React.use pour déballer les params (Next.js 14+)
  // Mais gérer également la rétrocompatibilité
  let courseId: string;
  let chapterId: string;

  try {
    // Essayer d'utiliser React.use si disponible
    const unwrappedParams = React.use(params as any) as { courseId: string; chapterId: string };
    courseId = unwrappedParams.courseId;
    chapterId = unwrappedParams.chapterId;
  } catch (error) {
    // Fallback pour la rétrocompatibilité
    courseId = (params as any).courseId;
    chapterId = (params as any).chapterId;
  }
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchChapterData();
    }
  }, [status, courseId, chapterId]);
  
  const fetchChapterData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter data');
      }
      
      const data = await response.json();
      
      setChapter(data.chapter);
      setCourse(data.course);
      setNextChapter(data.nextChapter);
      setPrevChapter(data.prevChapter);
      
      // Mark chapter as viewed
      markChapterAsCompleted();
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      toast.error('Erreur lors du chargement du chapitre');
    } finally {
      setLoading(false);
    }
  };
  
  const markChapterAsCompleted = async () => {
    try {
      if (!courseId || !chapterId) {
        throw new Error('ID du cours ou du chapitre manquant');
      }
      
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Inclure un body vide mais valide en JSON pour éviter les erreurs potentielles
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: Impossible de mettre à jour la progression`);
      }
      
      const result = await response.json();
      setCompleted(true);
      
      // Afficher le pourcentage de progression si disponible
      if (result && typeof result.completionPercentage === 'number') {
        toast.success(`Chapitre terminé ! (${result.completionPercentage}% du cours complété)`);
      } else {
        toast.success('Chapitre marqué comme terminé');
      }
      
      // Forcer le rafraîchissement de la page pour mettre à jour l'UI
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating chapter progress:', error);
      toast.error(error.message || 'Impossible de marquer ce chapitre comme terminé');
    }
  };
  
  const handleMarkCompleted = () => {
    if (!completed) {
      markChapterAsCompleted();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!chapter || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Chapitre non trouvé</h1>
        <p className="text-gray-600 mb-6">Le chapitre que vous cherchez n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
        <Link
          href={`/my-courses/${courseId}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Retour à la formation
        </Link>
      </div>
    );
  }
  
  // Convertir l'URL de la vidéo en URL d'embed YouTube si nécessaire
  const embedVideoUrl = chapter.videoUrl ? getYouTubeEmbedUrl(chapter.videoUrl) : '';
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/my-courses" className="hover:text-blue-600">
          Mes formations
        </Link>{' '}
        /{' '}
        <Link href={`/my-courses/${courseId}`} className="hover:text-blue-600">
          {course.title}
        </Link>{' '}
        / <span className="text-gray-700">{chapter.title}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
          
          {/* Video player or content */}
          {embedVideoUrl ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
              <iframe
                src={embedVideoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <p className="text-gray-700">Aucune vidéo disponible pour ce chapitre.</p>
            </div>
          )}
          
          {/* Chapter content */}
          <div className="prose prose-blue max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
          </div>
          
          {/* Marquer comme terminé */}
          <div className="mb-8">
            <button
              onClick={handleMarkCompleted}
              disabled={completed}
              className={`px-4 py-2 rounded-md font-medium ${
                completed 
                  ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {completed ? '✓ Chapitre terminé' : 'Marquer comme terminé'}
            </button>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {prevChapter ? (
              <Link 
                href={`/my-courses/${courseId}/chapters/${prevChapter._id}`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Chapitre précédent
              </Link>
            ) : (
              <div></div>
            )}
            
            {nextChapter ? (
              <Link 
                href={`/my-courses/${courseId}/chapters/${nextChapter._id}`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                Chapitre suivant
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-5.293-5.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            ) : (
              <Link 
                href={`/my-courses/${courseId}/quizzes`}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Vers les quiz
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-5.293-5.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contenu de la formation</h2>
            
            <ul className="space-y-3">
              {course.chapters.map((courseChapter: any) => (
                <li key={courseChapter._id}>
                  <Link
                    href={`/my-courses/${courseId}/chapters/${courseChapter._id}`}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      courseChapter._id === chapter._id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {courseChapter.title}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href={`/my-courses/${courseId}`}
                className="block text-center w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm transition-colors"
              >
                Retour à la formation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
