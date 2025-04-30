'use client';

import { useState } from 'react';
import { Chapter } from '@/lib/types';

interface ChapterManagerProps {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}

export default function ChapterManager({ chapters, onChange }: ChapterManagerProps) {
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isNewChapter, setIsNewChapter] = useState(false);
  
  const handleCreateChapter = () => {
    const newChapter: Chapter = {
      title: '',
      content: '',
      order: chapters.length,
    };
    setEditingChapter(newChapter);
    setIsNewChapter(true);
  };
  
  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setIsNewChapter(false);
  };
  
  const handleDeleteChapter = (chapterToDelete: Chapter) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      const newChapters = chapters.filter(chapter => 
        chapter._id !== chapterToDelete._id
      );
      
      // Reorder remaining chapters
      const reorderedChapters = newChapters.map((chapter, index) => ({
        ...chapter,
        order: index,
      }));
      
      onChange(reorderedChapters);
    }
  };
  
  const handleSaveChapter = () => {
    if (!editingChapter) return;
    
    if (isNewChapter) {
      // Add new chapter
      onChange([...chapters, editingChapter]);
    } else {
      // Update existing chapter
      const updatedChapters = chapters.map(chapter => 
        chapter._id === editingChapter._id ? editingChapter : chapter
      );
      onChange(updatedChapters);
    }
    
    setEditingChapter(null);
    setIsNewChapter(false);
  };
  
  const handleMoveChapter = (chapterId: string | undefined, direction: 'up' | 'down') => {
    if (!chapterId) return;
    
    const chapterIndex = chapters.findIndex(chapter => chapter._id === chapterId);
    if (chapterIndex === -1) return;
    
    const newChapters = [...chapters];
    
    if (direction === 'up' && chapterIndex > 0) {
      // Swap with previous chapter
      [newChapters[chapterIndex - 1], newChapters[chapterIndex]] = 
      [newChapters[chapterIndex], newChapters[chapterIndex - 1]];
    } else if (direction === 'down' && chapterIndex < chapters.length - 1) {
      // Swap with next chapter
      [newChapters[chapterIndex], newChapters[chapterIndex + 1]] = 
      [newChapters[chapterIndex + 1], newChapters[chapterIndex]];
    } else {
      return;
    }
    
    // Update order property
    const reorderedChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      order: index,
    }));
    
    onChange(reorderedChapters);
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Chapitres</h3>
        <button
          type="button"
          onClick={handleCreateChapter}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ajouter un chapitre
        </button>
      </div>
      
      {chapters.length === 0 && !editingChapter && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-500">Aucun chapitre ajouté pour l'instant.</p>
          <button
            type="button"
            onClick={handleCreateChapter}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ajouter le premier chapitre
          </button>
        </div>
      )}
      
      {!editingChapter ? (
        <ul className="border rounded-md divide-y divide-gray-200">
          {chapters.map((chapter, index) => (
            <li key={chapter._id || index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="flex items-center justify-center bg-blue-100 text-blue-700 h-6 w-6 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{chapter.title}</h4>
                    {chapter.videoUrl && (
                      <span className="text-xs text-gray-500 flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Inclut une vidéo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleMoveChapter(chapter._id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded-full ${
                      index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveChapter(chapter._id, 'down')}
                    disabled={index === chapters.length - 1}
                    className={`p-1 rounded-full ${
                      index === chapters.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditChapter(chapter)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChapter(chapter)}
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isNewChapter ? 'Ajouter un chapitre' : 'Modifier le chapitre'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="chapterTitle" className="block text-sm font-medium text-gray-700">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="chapterTitle"
                value={editingChapter.title}
                onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                className="mt-1 form-input"
                placeholder="Titre du chapitre"
              />
            </div>
            
            <div>
              <label htmlFor="chapterVideoUrl" className="block text-sm font-medium text-gray-700">
                URL de la vidéo (optionnel)
              </label>
              <input
                type="text"
                id="chapterVideoUrl"
                value={editingChapter.videoUrl || ''}
                onChange={(e) => setEditingChapter({ ...editingChapter, videoUrl: e.target.value })}
                className="mt-1 form-input"
                placeholder="ex: https://example.com/video.mp4"
              />
              <p className="mt-1 text-xs text-gray-500">
                Indiquer l'URL d'une vidéo hébergée sur un service comme YouTube, Vimeo ou un lien direct.
              </p>
            </div>
            
            <div>
              <label htmlFor="chapterContent" className="block text-sm font-medium text-gray-700">
                Contenu <span className="text-red-500">*</span>
              </label>
              <textarea
                id="chapterContent"
                value={editingChapter.content}
                onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                rows={6}
                className="mt-1 form-input"
                placeholder="Contenu du chapitre (supporte le HTML pour le formatage)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Vous pouvez utiliser des balises HTML pour formatter votre contenu.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingChapter(null);
                  setIsNewChapter(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveChapter}
                disabled={!editingChapter.title || !editingChapter.content}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  !editingChapter.title || !editingChapter.content
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isNewChapter ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
