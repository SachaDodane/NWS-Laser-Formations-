'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import React from 'react';

interface QuizPageProps {
  params: {
    courseId: string;
    quizId: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Utiliser React.use pour déballer les params (Next.js 14+)
  // Mais gérer également la rétrocompatibilité
  let courseId: string;
  let quizId: string;

  try {
    // Essayer d'utiliser React.use si disponible
    const unwrappedParams = React.use(params as any) as { courseId: string; quizId: string };
    courseId = unwrappedParams.courseId;
    quizId = unwrappedParams.quizId;
  } catch (error) {
    // Fallback pour la rétrocompatibilité
    courseId = (params as any).courseId;
    quizId = (params as any).quizId;
  }
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState('');
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchQuizData();
    }
  }, [status, courseId, quizId]);
  
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      
      const data = await response.json();
      
      setQuiz(data.quiz);
      setCourse(data.course);
      setQuizResult(data.quizResult);
      
      // Initialize selected answers array
      if (data.quiz) {
        setSelectedAnswers(Array(data.quiz.questions.length).fill(-1));
      }
      
      // If there's a certificate, show certificate option
      if (data.certificate) {
        setShowCertificate(true);
        setCertificateUrl(data.certificate.certificateUrl);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast.error('Erreur lors du chargement du quiz');
    } finally {
      setLoading(false);
    }
  };
  
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(-1));
    setQuizCompleted(false);
    setScore(0);
    setPassed(false);
  };
  
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const calculateScore = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
    return calculatedScore;
  };
  
  const submitQuiz = async () => {
    const calculatedScore = calculateScore();
    const isPassed = calculatedScore >= quiz.passingScore;
    
    setScore(calculatedScore);
    setPassed(isPassed);
    setQuizCompleted(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: calculatedScore,
          passed: isPassed,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const data = await response.json();
      
      // If certificate is generated, show it
      if (data.certificate) {
        setShowCertificate(true);
        setCertificateUrl(data.certificate.certificateUrl);
      }
      
      // Show appropriate message
      if (isPassed) {
        toast.success(`Félicitations ! Vous avez réussi avec un score de ${calculatedScore}%`);
      } else {
        toast.info(`Vous avez obtenu un score de ${calculatedScore}%. Score minimum requis: ${quiz.passingScore}%`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Erreur lors de la soumission du quiz');
    }
  };
  
  const canSubmit = () => {
    return selectedAnswers.every(answer => answer !== -1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!quiz || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quiz non trouvé</h1>
        <p className="text-gray-600 mb-6">Le quiz que vous cherchez n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
        <Link
          href={`/my-courses/${courseId}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Retour à la formation
        </Link>
      </div>
    );
  }
  
  // Quiz intro screen
  if (!quizStarted && !quizCompleted) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href={`/my-courses/${courseId}`}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la formation
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">À propos de ce quiz</h2>
                <p className="text-gray-600 mb-4">{quiz.description || 'Ce quiz évaluera votre compréhension des concepts clés de cette section.'}</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quiz.questions.length} questions
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Score minimum requis: {quiz.passingScore}%
                  </li>
                  {quiz.isFinal && (
                    <li className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quiz final de certification
                    </li>
                  )}
                </ul>
              </div>
              
              {quizResult && (
                <div className={`mb-6 p-4 rounded-md ${quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${quizResult.passed ? 'text-green-800' : 'text-yellow-800'}`}>
                    Votre résultat précédent
                  </h3>
                  <p className={quizResult.passed ? 'text-green-700' : 'text-yellow-700'}>
                    Score: {quizResult.score}% {quizResult.passed ? '(Réussi)' : '(Non réussi)'}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Tentatives: {quizResult.attempts}
                  </p>
                </div>
              )}
              
              {showCertificate && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Certificat disponible
                  </h3>
                  <p className="text-green-700 mb-3">
                    Félicitations ! Vous avez terminé cette formation avec succès.
                  </p>
                  <a 
                    href={certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-green-700 bg-green-100 hover:bg-green-200 px-4 py-2 rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Télécharger le certificat
                  </a>
                </div>
              )}
              
              <button
                onClick={startQuiz}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {quizResult ? 'Refaire le quiz' : 'Commencer le quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz results screen
  if (quizCompleted) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Résultats du quiz</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            
            <div className="p-6">
              <div className={`mb-8 p-6 rounded-lg text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  {passed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-800' : 'text-red-800'}`}>
                  {passed ? 'Félicitations !' : 'Quiz non validé'}
                </h2>
                <p className={`text-lg ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  Votre score: {score}%
                </p>
                <p className="text-gray-600 mt-1">
                  Score minimum requis: {quiz.passingScore}%
                </p>
              </div>
              
              {quiz.questions.map((question: any, index: number) => (
                <div 
                  key={index} 
                  className={`mb-6 p-4 rounded-md ${
                    selectedAnswers[index] === question.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 bg-white text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-900 mb-2">{question.question}</h3>
                      <ul className="space-y-2 mb-3">
                        {question.options.map((option: string, optIndex: number) => (
                          <li key={optIndex} className="flex items-start">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                              optIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-700'
                                : optIndex === selectedAnswers[index]
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {optIndex === question.correctAnswer ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : optIndex === selectedAnswers[index] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : null}
                            </div>
                            <span className={`${
                              optIndex === question.correctAnswer
                                ? 'text-green-700 font-medium'
                                : optIndex === selectedAnswers[index]
                                ? 'text-red-700'
                                : 'text-gray-700'
                            }`}>
                              {option}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {question.explanation && (
                        <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                          <strong>Explication:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={startQuiz}
                  className="sm:flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Refaire le quiz
                </button>
                <Link
                  href={`/my-courses/${courseId}`}
                  className="sm:flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-center"
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
  
  // Quiz questions screen
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Question {currentQuestion + 1}/{quiz.questions.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {quiz.questions[currentQuestion].question}
              </h2>
              
              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option: string, index: number) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswers[currentQuestion] === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        selectedAnswers[currentQuestion] === index 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={selectedAnswers[currentQuestion] === index ? 'text-blue-700' : 'text-gray-700'}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 border border-gray-300 rounded-md ${
                  currentQuestion === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                Précédent
              </button>
              
              {currentQuestion < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestion] === -1}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                    selectedAnswers[currentQuestion] === -1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-700'
                  }`}
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={!canSubmit()}
                  className={`px-4 py-2 bg-green-600 text-white rounded-md ${
                    !canSubmit() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-green-700'
                  }`}
                >
                  Terminer le quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
