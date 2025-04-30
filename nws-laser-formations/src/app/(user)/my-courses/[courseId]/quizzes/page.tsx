'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  isFinal: boolean;
  passingScore: number;
  questions: any[];
}

interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export default function QuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        
        // Vérifier si l'utilisateur est connecté
        const session = await getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Récupérer les données du cours
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Erreur lors de la récupération du cours');
        }
        
        const courseData = await courseResponse.json();
        setCourseTitle(courseData.title);
        
        // Récupérer les quiz du cours
        const quizzesResponse = await fetch(`/api/courses/${courseId}/quizzes`);
        if (!quizzesResponse.ok) {
          throw new Error('Erreur lors de la récupération des quiz');
        }
        
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData);
        
        // Récupérer les résultats des quiz de l'utilisateur
        const progressResponse = await fetch(`/api/courses/${courseId}/progress`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData && progressData.quizResults) {
            setQuizResults(progressData.quizResults);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors du chargement des quiz.');
        toast.error('Impossible de charger les quiz. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId, router]);

  // Fonction pour obtenir le résultat d'un quiz
  const getQuizResult = (quizId: string) => {
    return quizResults.find(result => result.quizId === quizId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Erreur</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/my-courses/${courseId}`} className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au cours
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">Quiz pour {courseTitle}</h1>
          <p className="text-gray-600 mt-2">Testez vos connaissances avec ces quiz interactifs.</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun quiz disponible</h3>
            <p className="mt-1 text-gray-500">Ce cours ne contient pas encore de quiz.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1">
            {quizzes.map((quiz) => {
              const result = getQuizResult(quiz._id);
              const hasAttempted = !!result;
              const hasPassed = hasAttempted && result.passed;
              
              return (
                <div key={quiz._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          {quiz.title}
                          {quiz.isFinal && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Quiz Final
                            </span>
                          )}
                        </h2>
                        {quiz.description && (
                          <p className="mt-2 text-gray-600">{quiz.description}</p>
                        )}
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Score minimum: {quiz.passingScore}%
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {hasAttempted ? (
                          <div className={`text-center p-3 rounded-lg ${hasPassed ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className={`text-2xl font-bold ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {result.score}%
                            </div>
                            <div className={`text-sm ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {hasPassed ? 'Réussi' : 'Échoué'}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      {hasAttempted ? (
                        <>
                          <span className="text-sm text-gray-500">
                            Tentative le {new Date(result.attemptedAt).toLocaleDateString('fr-FR')}
                          </span>
                          <Link 
                            href={`/my-courses/${courseId}/quizzes/${quiz._id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {hasPassed ? 'Revoir le quiz' : 'Réessayer'}
                          </Link>
                        </>
                      ) : (
                        <Link 
                          href={`/my-courses/${courseId}/quizzes/${quiz._id}`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Commencer le quiz
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
