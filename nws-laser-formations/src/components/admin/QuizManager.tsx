'use client';

import { useState } from 'react';
import { Quiz, QuizQuestion } from '@/lib/types';

interface QuizManagerProps {
  quizzes: Quiz[];
  onChange: (quizzes: Quiz[]) => void;
}

export default function QuizManager({ quizzes, onChange }: QuizManagerProps) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isNewQuiz, setIsNewQuiz] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  
  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      title: '',
      description: '',
      questions: [],
      isFinal: false,
      passingScore: 80,
    };
    setEditingQuiz(newQuiz);
    setIsNewQuiz(true);
    setEditingQuestion(null);
  };
  
  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({ ...quiz });
    setIsNewQuiz(false);
    setEditingQuestion(null);
  };
  
  const handleDeleteQuiz = (quizToDelete: Quiz) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      const newQuizzes = quizzes.filter(quiz => 
        quiz._id !== quizToDelete._id
      );
      onChange(newQuizzes);
    }
  };
  
  const handleSaveQuiz = () => {
    if (!editingQuiz) return;
    
    if (isNewQuiz) {
      // Add new quiz
      onChange([...quizzes, editingQuiz]);
    } else {
      // Update existing quiz
      const updatedQuizzes = quizzes.map(quiz => 
        quiz._id === editingQuiz._id ? editingQuiz : quiz
      );
      onChange(updatedQuizzes);
    }
    
    setEditingQuiz(null);
    setIsNewQuiz(false);
    setEditingQuestion(null);
  };
  
  const handleCreateQuestion = () => {
    if (!editingQuiz) return;
    
    const newQuestion: QuizQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    
    setEditingQuestion(newQuestion);
    setIsNewQuestion(true);
  };
  
  const handleEditQuestion = (question: QuizQuestion, index: number) => {
    setEditingQuestion({ 
      ...question,
      _questionIndex: index  // Keep track of the index for updating
    });
    setIsNewQuestion(false);
  };
  
  const handleSaveQuestion = () => {
    if (!editingQuiz || !editingQuestion) return;
    
    // Filter out empty options
    const filteredOptions = editingQuestion.options.filter(opt => opt.trim() !== '');
    
    // Ensure we have at least 2 options
    if (filteredOptions.length < 2) {
      alert('Le quiz doit comporter au moins 2 options de réponse.');
      return;
    }
    
    // Make sure correctAnswer is within bounds
    const correctAnswer = Math.min(editingQuestion.correctAnswer, filteredOptions.length - 1);
    
    const updatedQuestion = {
      ...editingQuestion,
      options: filteredOptions,
      correctAnswer
    };
    
    let updatedQuestions;
    
    if (isNewQuestion) {
      // Add new question
      updatedQuestions = [...editingQuiz.questions, updatedQuestion];
    } else {
      // Update existing question
      const questionIndex = (editingQuestion as any)._questionIndex;
      updatedQuestions = [...editingQuiz.questions];
      updatedQuestions[questionIndex] = updatedQuestion;
    }
    
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQuestions
    });
    
    setEditingQuestion(null);
    setIsNewQuestion(false);
  };
  
  const handleDeleteQuestion = (index: number) => {
    if (!editingQuiz) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      const updatedQuestions = [...editingQuiz.questions];
      updatedQuestions.splice(index, 1);
      
      setEditingQuiz({
        ...editingQuiz,
        questions: updatedQuestions
      });
    }
  };
  
  const handleAddOption = () => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, '']
    });
  };
  
  const handleRemoveOption = (index: number) => {
    if (!editingQuestion) return;
    
    // Don't remove if we only have 2 options
    if (editingQuestion.options.length <= 2) {
      alert('Un quiz doit comporter au moins 2 options de réponse.');
      return;
    }
    
    const updatedOptions = [...editingQuestion.options];
    updatedOptions.splice(index, 1);
    
    // If we're removing the correct answer or an option before it,
    // adjust the correct answer index
    let correctAnswer = editingQuestion.correctAnswer;
    if (index === correctAnswer) {
      correctAnswer = 0;
    } else if (index < correctAnswer) {
      correctAnswer--;
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions,
      correctAnswer
    });
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Quiz et évaluations</h3>
        {!editingQuiz && (
          <button
            type="button"
            onClick={handleCreateQuiz}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ajouter un quiz
          </button>
        )}
      </div>
      
      {quizzes.length === 0 && !editingQuiz && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-500">Aucun quiz ajouté pour l'instant.</p>
          <button
            type="button"
            onClick={handleCreateQuiz}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ajouter le premier quiz
          </button>
        </div>
      )}
      
      {!editingQuiz ? (
        <ul className="border rounded-md divide-y divide-gray-200">
          {quizzes.map((quiz, index) => (
            <li key={quiz._id || index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{quiz.title}</h4>
                    {quiz.isFinal && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Quiz Final
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.questions.length} question(s) • Score minimum : {quiz.passingScore}%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditQuiz(quiz)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white p-6 border rounded-md shadow-sm">
          {!editingQuestion ? (
            // Quiz edit form
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isNewQuiz ? 'Ajouter un quiz' : 'Modifier le quiz'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="quizTitle"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="mt-1 form-input"
                    placeholder="Titre du quiz"
                  />
                </div>
                
                <div>
                  <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="quizDescription"
                    value={editingQuiz.description || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                    rows={2}
                    className="mt-1 form-input"
                    placeholder="Description du quiz (optionnel)"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="quizIsFinal"
                    checked={editingQuiz.isFinal}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, isFinal: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="quizIsFinal" className="ml-2 block text-sm text-gray-700">
                    Quiz final de certification
                  </label>
                </div>
                
                <div>
                  <label htmlFor="quizPassingScore" className="block text-sm font-medium text-gray-700">
                    Score minimum pour réussir (%)
                  </label>
                  <input
                    type="number"
                    id="quizPassingScore"
                    value={editingQuiz.passingScore}
                    onChange={(e) => setEditingQuiz({ 
                      ...editingQuiz, 
                      passingScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) 
                    })}
                    min="0"
                    max="100"
                    className="mt-1 form-input w-24"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Questions</h4>
                  
                  {editingQuiz.questions.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-2">Aucune question ajoutée.</p>
                  ) : (
                    <ul className="mb-4 space-y-2">
                      {editingQuiz.questions.map((question, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center bg-blue-100 text-blue-700 h-6 w-6 rounded-full text-xs font-medium mr-3">
                              {index + 1}
                            </span>
                            <div className="text-sm">
                              <p className="font-medium text-gray-800">{question.question}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {question.options.length} options • Réponse correcte : {question.correctAnswer + 1}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditQuestion(question, index)}
                              className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(index)}
                              className="p-1 rounded-full text-gray-400 hover:text-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleCreateQuestion}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une question
                  </button>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuiz(null);
                      setIsNewQuiz(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuiz}
                    disabled={!editingQuiz.title}
                    className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                      !editingQuiz.title
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {isNewQuiz ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Question edit form
            <div>
              <div className="flex items-center mb-4">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <h3 className="text-lg font-medium text-gray-900">
                  {isNewQuestion ? 'Ajouter une question' : 'Modifier la question'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="questionText"
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="mt-1 form-input"
                    placeholder="Texte de la question"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options de réponse <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une option
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex items-center mr-3">
                          <input
                            type="radio"
                            id={`option-${index}`}
                            name="correctAnswer"
                            checked={editingQuestion.correctAnswer === index}
                            onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`option-${index}`} className="ml-2 block text-sm text-gray-700">
                            Correcte
                          </label>
                        </div>
                        
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...editingQuestion.options];
                            updatedOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                          }}
                          className="mt-1 form-input flex-1"
                          placeholder={`Option ${index + 1}`}
                        />
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-500"
                          title="Supprimer cette option"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="questionExplanation" className="block text-sm font-medium text-gray-700">
                    Explication (optionnelle)
                  </label>
                  <textarea
                    id="questionExplanation"
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    rows={2}
                    className="mt-1 form-input"
                    placeholder="Explication qui sera montrée après que l'étudiant ait répondu"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    disabled={!editingQuestion.question || editingQuestion.options.filter(o => o.trim()).length < 2}
                    className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                      !editingQuestion.question || editingQuestion.options.filter(o => o.trim()).length < 2
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {isNewQuestion ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
