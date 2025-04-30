'use client';

import { useState } from 'react';

interface Question {
  _id: string;
  question: string;
  options: string[];
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  isFinal: boolean;
  passingScore: number;
  questions: Question[];
  isCompleted: boolean;
  lastScore: number;
  lastAttemptDate: string | null;
  isPassed: boolean;
}

interface QuizFormProps {
  quiz: Quiz;
  userId: string;
  courseId: string;
  onCompleted: (quiz: Quiz, score: number, isPassed: boolean) => void;
}

export default function QuizForm({ quiz, userId, courseId, onCompleted }: QuizFormProps) {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    feedback: { questionId: string; isCorrect: boolean; explanation?: string }[];
  } | null>(null);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });

    // Réinitialiser l'erreur lorsque l'utilisateur change une réponse
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que toutes les questions ont une réponse
    const unansweredQuestions = quiz.questions.filter(q => answers[q._id] === undefined);

    if (unansweredQuestions.length > 0) {
      setError(`Veuillez répondre à toutes les questions. ${unansweredQuestions.length} question(s) sans réponse.`);

      // Faire défiler jusqu'à la première question sans réponse
      const firstUnansweredQuestionId = unansweredQuestions[0]._id;
      const element = document.getElementById(`question-${firstUnansweredQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-question');
        setTimeout(() => element.classList.remove('highlight-question'), 2000);
      }

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/progress/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          quizId: quiz._id,
          answers: Object.entries(answers).map(([questionId, optionIndex]) => ({
            questionId,
            answerIndex: optionIndex,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: `Erreur ${response.status}` }));
        throw new Error(data.message || 'Une erreur est survenue lors de la soumission du quiz');
      }

      const result = await response.json();

      setQuizResult(result);

      // Appeler le callback onCompleted avec le résultat
      onCompleted(quiz, result.score, result.isPassed);

      // Faire défiler jusqu'en haut pour voir le résultat
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erreur lors de la soumission du quiz:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission du quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If quiz is already completed and passed, show a success message
  if (quiz.isPassed) {
    return (
      <div className="bg-green-50 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-green-900">Quiz réussi !</h3>
        <p className="mt-1 text-green-700">
          Vous avez réussi ce quiz avec un score de {quiz.lastScore}%.
        </p>
        <p className="mt-1 text-green-700">
          {quiz.isFinal ? 'Votre certificat a été généré et est disponible dans votre espace personnel.' : 'Vous pouvez continuer votre progression.'}
        </p>
      </div>
    );
  }

  // If result is available, show it
  if (quizResult) {
    const passedText = quizResult.isPassed
      ? 'Félicitations ! Vous avez réussi ce quiz.'
      : `Vous n'avez pas atteint le score requis de ${quiz.passingScore}%.`;

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className={`p-6 text-center ${quizResult.isPassed ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${
            quizResult.isPassed ? 'bg-green-100' : 'bg-yellow-100'
          } mx-auto`}>
            {quizResult.isPassed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h3 className={`mt-2 text-lg font-medium ${quizResult.isPassed ? 'text-green-900' : 'text-yellow-900'}`}>
            {passedText}
          </h3>
          <p className={`mt-1 ${quizResult.isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
            Votre score : {quizResult.score}%
          </p>
          <p className={`mt-1 ${quizResult.isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
            {quizResult.correctAnswers} réponses correctes sur {quizResult.totalQuestions} questions
          </p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Résultats détaillés</h3>

          <ul className="space-y-4">
            {quizResult.feedback.map((feedback, index) => (
              <li key={feedback.questionId} className={`p-4 rounded-lg ${
                feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-5 h-5 mr-2 ${
                    feedback.isCorrect ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {feedback.isCorrect ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Question {index + 1}: {quiz.questions[index].question}
                    </p>
                    {feedback.explanation && (
                      <p className="mt-1 text-sm text-gray-600">
                        {feedback.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {!quizResult.isPassed && !quiz.isFinal && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAnswers({});
                  setQuizResult(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réessayer le quiz
              </button>
            </div>
          )}

          {!quizResult.isPassed && quiz.isFinal && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas réussi le quiz final. Pour obtenir votre certificat, vous devez obtenir un score d'au moins {quiz.passingScore}%.
              </p>
              <button
                onClick={() => {
                  setAnswers({});
                  setQuizResult(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réessayer le quiz final
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {quiz.questions.map((question, questionIndex) => (
        <div key={question._id} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-900 mb-2">
            {questionIndex + 1}. {question.question}
          </h3>

          <div className="space-y-2 mt-4">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`question-${question._id}-option-${optionIndex}`}
                    name={`question-${question._id}`}
                    type="radio"
                    checked={answers[question._id] === optionIndex}
                    onChange={() => handleAnswerChange(question._id, optionIndex)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={`question-${question._id}-option-${optionIndex}`}
                    className="font-medium text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vérification...
            </>
          ) : (
            'Soumettre mes réponses'
          )}
        </button>
      </div>
    </form>
  );
}
