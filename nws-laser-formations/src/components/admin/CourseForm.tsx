'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Chapter {
  _id?: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  isFinal: boolean;
  passingScore: number;
  questions: QuizQuestion[];
}

interface CourseData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  chapters: Chapter[];
  quizzes: Quiz[];
}

interface CourseFormProps {
  initialData?: CourseData;
  courseId?: string;
}

const defaultCourse: CourseData = {
  title: '',
  description: '',
  price: 0,
  imageUrl: '',
  chapters: [],
  quizzes: []
};

export default function CourseForm({ initialData, courseId }: CourseFormProps = {}) {
  const router = useRouter();
  
  const [course, setCourse] = useState<CourseData>(initialData || defaultCourse);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Active tab for chapters and quizzes management
  const [activeTab, setActiveTab] = useState<'info' | 'chapters' | 'quizzes'>('info');
  
  // States for chapters management
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);
  
  // States for quizzes management
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  
  // Handler for basic info form fields
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setCourse({
        ...course,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCourse({
        ...course,
        [name]: value
      });
    }
  };
  
  // Handler for chapter operations
  const handleAddChapter = () => {
    const newChapter: Chapter = {
      title: `Chapitre ${course.chapters.length + 1}`,
      content: '',
      videoUrl: '',
      order: course.chapters.length
    };
    
    setCourse({
      ...course,
      chapters: [...course.chapters, newChapter]
    });
    
    setSelectedChapterIndex(course.chapters.length);
  };
  
  const handleUpdateChapter = (index: number, field: keyof Chapter, value: string | number) => {
    const updatedChapters = [...course.chapters];
    updatedChapters[index] = {
      ...updatedChapters[index],
      [field]: value
    };
    
    setCourse({
      ...course,
      chapters: updatedChapters
    });
  };
  
  const handleDeleteChapter = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      const updatedChapters = course.chapters.filter((_, i) => i !== index);
      
      // Reorder remaining chapters
      const reorderedChapters = updatedChapters.map((chapter, i) => ({
        ...chapter,
        order: i
      }));
      
      setCourse({
        ...course,
        chapters: reorderedChapters
      });
      
      setSelectedChapterIndex(null);
    }
  };
  
  // Handler for quiz operations
  const handleAddQuiz = () => {
    const newQuiz: Quiz = {
      title: `Quiz ${course.quizzes.length + 1}`,
      description: '',
      isFinal: course.quizzes.length === 0, // First quiz is final by default
      passingScore: 70,
      questions: []
    };
    
    setCourse({
      ...course,
      quizzes: [...course.quizzes, newQuiz]
    });
    
    setSelectedQuizIndex(course.quizzes.length);
  };
  
  const handleUpdateQuiz = (index: number, field: keyof Quiz, value: string | number | boolean) => {
    const updatedQuizzes = [...course.quizzes];
    
    if (field === 'isFinal' && value === true) {
      // Make sure only one quiz is marked as final
      updatedQuizzes.forEach((quiz, i) => {
        quiz.isFinal = i === index;
      });
    } else {
      updatedQuizzes[index] = {
        ...updatedQuizzes[index],
        [field]: value
      };
    }
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
  };
  
  const handleDeleteQuiz = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      const updatedQuizzes = course.quizzes.filter((_, i) => i !== index);
      
      setCourse({
        ...course,
        quizzes: updatedQuizzes
      });
      
      setSelectedQuizIndex(null);
      setSelectedQuestionIndex(null);
    }
  };
  
  // Handler for quiz question operations
  const handleAddQuestion = (quizIndex: number) => {
    const updatedQuizzes = [...course.quizzes];
    
    const newQuestion: QuizQuestion = {
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
      explanation: ''
    };
    
    updatedQuizzes[quizIndex].questions.push(newQuestion);
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
    
    setSelectedQuestionIndex(updatedQuizzes[quizIndex].questions.length - 1);
  };
  
  const handleUpdateQuestion = (
    quizIndex: number,
    questionIndex: number,
    field: keyof QuizQuestion,
    value: string | number | string[]
  ) => {
    const updatedQuizzes = [...course.quizzes];
    
    updatedQuizzes[quizIndex].questions[questionIndex] = {
      ...updatedQuizzes[quizIndex].questions[questionIndex],
      [field]: value
    };
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
  };
  
  const handleUpdateQuestionOption = (
    quizIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuizzes = [...course.quizzes];
    const options = [...updatedQuizzes[quizIndex].questions[questionIndex].options];
    
    options[optionIndex] = value;
    
    updatedQuizzes[quizIndex].questions[questionIndex] = {
      ...updatedQuizzes[quizIndex].questions[questionIndex],
      options
    };
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
  };
  
  const handleAddQuestionOption = (quizIndex: number, questionIndex: number) => {
    const updatedQuizzes = [...course.quizzes];
    const options = [...updatedQuizzes[quizIndex].questions[questionIndex].options];
    
    options.push(`Option ${options.length + 1}`);
    
    updatedQuizzes[quizIndex].questions[questionIndex] = {
      ...updatedQuizzes[quizIndex].questions[questionIndex],
      options
    };
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
  };
  
  const handleDeleteQuestionOption = (quizIndex: number, questionIndex: number, optionIndex: number) => {
    const updatedQuizzes = [...course.quizzes];
    
    if (updatedQuizzes[quizIndex].questions[questionIndex].options.length <= 2) {
      alert('Une question doit avoir au moins 2 options.');
      return;
    }
    
    const options = updatedQuizzes[quizIndex].questions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    
    // If deleted option was the correct answer, reset correctAnswer to first option
    let correctAnswer = updatedQuizzes[quizIndex].questions[questionIndex].correctAnswer;
    if (correctAnswer === optionIndex) {
      correctAnswer = 0;
    } else if (correctAnswer > optionIndex) {
      correctAnswer = correctAnswer - 1;
    }
    
    updatedQuizzes[quizIndex].questions[questionIndex] = {
      ...updatedQuizzes[quizIndex].questions[questionIndex],
      options,
      correctAnswer
    };
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    });
  };
  
  const handleDeleteQuestion = (quizIndex: number, questionIndex: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      const updatedQuizzes = [...course.quizzes];
      
      updatedQuizzes[quizIndex].questions = updatedQuizzes[quizIndex].questions.filter(
        (_, i) => i !== questionIndex
      );
      
      setCourse({
        ...course,
        quizzes: updatedQuizzes
      });
      
      setSelectedQuestionIndex(null);
    }
  };
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!course.title.trim()) {
      setError('Le titre est requis');
      return;
    }
    
    if (!course.description.trim()) {
      setError('La description est requise');
      return;
    }
    
    if (course.price < 0) {
      setError('Le prix ne peut pas être négatif');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = courseId 
        ? `/api/admin/courses/${courseId}` 
        : '/api/admin/courses';
      
      const method = courseId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }
      
      const data = await response.json();
      
      if (courseId) {
        setSuccessMessage('Formation mise à jour avec succès');
        setTimeout(() => router.refresh(), 1500);
      } else {
        // Redirect to edit page for new course
        router.push(`/admin/courses/${data._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'chapters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chapitres ({course.chapters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quiz ({course.quizzes.length})
          </button>
        </nav>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 my-4">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 my-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Basic Info Tab */}
      {activeTab === 'info' && (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre de la formation<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={course.title}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                value={course.description}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Prix (€)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                value={course.price}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                URL de l'image
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                value={course.imageUrl || ''}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {course.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                  <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-lg border border-gray-300">
                    {/* Remplacer Image par img pour éviter les restrictions de domaine */}
                    <img
                      src={course.imageUrl}
                      alt="Course preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        setCourse({
                          ...course,
                          imageUrl: ''
                        });
                        alert('L\'image n\'a pas pu être chargée. Veuillez vérifier l\'URL.');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chapters Tab */}
      {activeTab === 'chapters' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Chapitres du cours</h3>
            <button
              type="button"
              onClick={handleAddChapter}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter un chapitre
            </button>
          </div>
          
          {course.chapters.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun chapitre</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter un chapitre à votre formation.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter un chapitre
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-6">
              {/* Chapter list */}
              <div className="w-1/3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Liste des chapitres</h4>
                  <ul className="space-y-2">
                    {course.chapters.map((chapter, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => setSelectedChapterIndex(index)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                            selectedChapterIndex === index
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {index + 1}. {chapter.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Chapter edit form */}
              <div className="w-2/3">
                {selectedChapterIndex !== null ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Éditer le chapitre {selectedChapterIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteChapter(selectedChapterIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Titre du chapitre
                        </label>
                        <input
                          type="text"
                          value={course.chapters[selectedChapterIndex].title}
                          onChange={(e) => handleUpdateChapter(selectedChapterIndex, 'title', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          URL de la vidéo
                        </label>
                        <input
                          type="url"
                          value={course.chapters[selectedChapterIndex].videoUrl || ''}
                          onChange={(e) => handleUpdateChapter(selectedChapterIndex, 'videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/embed/..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Contenu du chapitre
                        </label>
                        <textarea
                          rows={8}
                          value={course.chapters[selectedChapterIndex].content}
                          onChange={(e) => handleUpdateChapter(selectedChapterIndex, 'content', e.target.value)}
                          placeholder="Contenu du chapitre au format Markdown..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Sélectionnez un chapitre à éditer ou ajoutez-en un nouveau.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Form Submit Button */}
      <div className="px-6 py-4 bg-gray-50 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : (
            courseId ? 'Mettre à jour la formation' : 'Créer la formation'
          )}
        </button>
      </div>
    </form>
  );
}
