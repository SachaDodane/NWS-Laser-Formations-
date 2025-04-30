'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import QuizForm from './QuizForm';
import ClientDate from '../common/ClientDate';

interface Chapter {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  isCompleted: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  isFinal: boolean;
  passingScore: number;
  questions: any[];
  isCompleted: boolean;
  lastScore: number;
  lastAttemptDate: string | null;
  isPassed: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  chapters: Chapter[];
  quizzes: Quiz[];
}

interface CourseContentProps {
  course: Course;
  userId: string;
}

export default function CourseContent({ course, userId }: CourseContentProps) {
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(
    course.chapters.length > 0 ? course.chapters[0] : null
  );
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Get the final quiz
  const finalQuiz = course.quizzes.find(quiz => quiz.isFinal);
  
  // Handler for chapter completion
  const handleMarkChapterAsComplete = async (chapterId: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/progress/mark-chapter-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId: course._id,
          chapterId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Erreur ${response.status}: Impossible de marquer le chapitre comme terminé`);
      }
      
      const data = await response.json();
      
      // Update local state
      const updatedChapters = course.chapters.map(chapter => {
        if (chapter._id === chapterId) {
          return { ...chapter, isCompleted: true };
        }
        return chapter;
      });
      
      course.chapters = updatedChapters;
      
      // Afficher le pourcentage de progression si disponible
      if (data && typeof data.completionPercentage === 'number') {
        setSuccessMessage(`Chapitre terminé ! (${data.completionPercentage}% du cours complété)`);
      } else {
        setSuccessMessage('Chapitre marqué comme terminé !');
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // If there's a next chapter, move to it
      const currentIndex = course.chapters.findIndex(chapter => chapter._id === chapterId);
      if (currentIndex < course.chapters.length - 1) {
        // Ajouter un délai pour que l'utilisateur puisse voir le message de succès avant de passer au chapitre suivant
        setTimeout(() => {
          setActiveChapter(course.chapters[currentIndex + 1]);
          // Faire défiler jusqu'en haut pour voir le nouveau chapitre
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      }
      
      // Check if all chapters are completed to enable final quiz
      const allChaptersCompleted = updatedChapters.every(chapter => chapter.isCompleted);
      if (allChaptersCompleted && finalQuiz && !finalQuiz.isCompleted) {
        setSuccessMessage('Tous les chapitres terminés ! Vous pouvez maintenant faire le quiz final.');
      }
    } catch (err: any) {
      console.error('Erreur lors du marquage du chapitre:', err);
      setError(err.message || 'Une erreur est survenue lors du marquage du chapitre');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for quiz submission (completed in QuizForm component)
  const handleQuizCompleted = (quiz: Quiz, score: number, isPassed: boolean) => {
    // Update local state
    const updatedQuizzes = course.quizzes.map(q => {
      if (q._id === quiz._id) {
        return {
          ...q,
          isCompleted: true,
          lastScore: score,
          lastAttemptDate: new Date().toISOString(),
          isPassed,
        };
      }
      return q;
    });
    
    course.quizzes = updatedQuizzes;
    setActiveQuiz(null);
    
    if (isPassed) {
      if (quiz.isFinal) {
        setSuccessMessage('Félicitations ! Vous avez réussi le quiz final.');
        
        // Reload the page to show the certificate
        window.location.reload();
      } else {
        setSuccessMessage('Quiz réussi ! Continuez votre progression.');
      }
    } else {
      setSuccessMessage(`Score : ${score}%. Vous n'avez pas atteint le score minimum requis de ${quiz.passingScore}%.`);
    }
    
    setTimeout(() => setSuccessMessage(null), 5000);
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Error and success messages */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar navigation */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contenu du cours</h3>
          </div>
          
          {/* Chapter list */}
          <div className="p-2">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Chapitres
            </h4>
            <ul className="mt-2 space-y-1">
              {course.chapters.map((chapter) => (
                <li key={chapter._id}>
                  <button
                    onClick={() => {
                      setActiveChapter(chapter);
                      setActiveQuiz(null);
                    }}
                    className={`flex items-center px-3 py-2 w-full text-sm rounded-md ${
                      activeChapter?._id === chapter._id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 truncate text-left">
                      {chapter.order + 1}. {chapter.title}
                    </span>
                    {chapter.isCompleted && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quiz list */}
          <div className="p-2">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quiz
            </h4>
            <ul className="mt-2 space-y-1">
              {course.quizzes.map((quiz) => {
                const isFinalAndLocked = quiz.isFinal && !course.chapters.every(chapter => chapter.isCompleted);
                
                return (
                  <li key={quiz._id}>
                    <button
                      onClick={() => {
                        if (!isFinalAndLocked) {
                          setActiveQuiz(quiz);
                          setActiveChapter(null);
                        }
                      }}
                      disabled={isFinalAndLocked}
                      className={`flex items-center px-3 py-2 w-full text-sm rounded-md ${
                        isFinalAndLocked
                          ? 'text-gray-400 cursor-not-allowed'
                          : activeQuiz?._id === quiz._id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex-1 truncate text-left">
                        {quiz.title}
                      </span>
                      
                      {quiz.isFinal && (
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Final
                        </span>
                      )}
                      
                      {quiz.isCompleted && quiz.isPassed && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {activeChapter && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {activeChapter.title}
              </h2>
              
              {/* Video if available */}
              {activeChapter.videoUrl && (
                <div className="mb-6 relative pt-[56.25%]">
                  <iframe
                    src={activeChapter.videoUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              {/* Chapter content */}
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{activeChapter.content}</ReactMarkdown>
              </div>
              
              {/* Complete button */}
              <div className="mt-8 flex justify-end">
                {activeChapter.isCompleted ? (
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Chapitre terminé
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkChapterAsComplete(activeChapter._id)}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validation...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Marquer comme terminé
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {activeQuiz && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {activeQuiz.title}
              </h2>
              
              {activeQuiz.description && (
                <p className="text-gray-600 mb-6">{activeQuiz.description}</p>
              )}
              
              {activeQuiz.isPassed ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Vous avez déjà réussi ce quiz avec un score de {activeQuiz.lastScore}% le <ClientDate date={activeQuiz.lastAttemptDate} />.
                      </p>
                      {activeQuiz.isFinal && (
                        <p className="text-sm text-green-700 mt-2">
                          Votre certificat a été généré.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeQuiz.isCompleted ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Votre dernier score était de {activeQuiz.lastScore}% le <ClientDate date={activeQuiz.lastAttemptDate} />.
                        Pour réussir, vous devez obtenir au moins {activeQuiz.passingScore}%.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <QuizForm
                quiz={activeQuiz}
                userId={userId}
                courseId={course._id}
                onCompleted={handleQuizCompleted}
              />
            </div>
          )}
          
          {!activeChapter && !activeQuiz && (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                Sélectionnez un chapitre ou un quiz pour commencer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
