'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface DownloadCourseImageProps {
  courseId: string;
  currentImageUrl: string | null;
  onImageDownloaded: (newImagePath: string) => void;
}

export default function DownloadCourseImage({ 
  courseId, 
  currentImageUrl, 
  onImageDownloaded 
}: DownloadCourseImageProps) {
  const [loading, setLoading] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  
  // Fonction pour valider l'URL de l'image
  const validateImageUrl = (url: string): boolean => {
    if (!url) {
      setImageUrlError('Veuillez entrer une URL d\'image');
      return false;
    }
    
    try {
      new URL(url); // Vérifie si l'URL est valide
      
      // Vérifier si l'URL pointe vers une image (extensions communes)
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const fileExtension = url.split('.').pop()?.toLowerCase() || '';
      
      if (!imageExtensions.includes(fileExtension)) {
        setImageUrlError('L\'URL doit pointer vers une image (jpg, png, gif, etc.)');
        return false;
      }
      
      setImageUrlError(null);
      return true;
    } catch (e) {
      setImageUrlError('URL invalide');
      return false;
    }
  };
  
  // Fonction pour télécharger l'image depuis l'URL externe
  const downloadImage = async () => {
    if (!validateImageUrl(externalImageUrl)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/download-course-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          imageUrl: externalImageUrl
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue lors du téléchargement de l\'image');
      }
      
      const data = await response.json();
      
      toast.success('Image téléchargée et associée au cours avec succès');
      setExternalImageUrl('');
      
      // Informer le composant parent que l'image a été téléchargée
      onImageDownloaded(data.imagePath);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue lors du téléchargement de l\'image');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Télécharger l'image du cours</h3>
      
      {currentImageUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Image actuelle :</p>
          <div className="relative h-40 w-full mb-2">
            <Image
              src={currentImageUrl}
              alt="Image actuelle du cours"
              className="object-cover rounded"
              fill
            />
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="externalImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL de l'image externe
          </label>
          <input
            type="text"
            id="externalImageUrl"
            value={externalImageUrl}
            onChange={(e) => setExternalImageUrl(e.target.value)}
            placeholder="https://exemple.com/image.jpg"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {imageUrlError && (
            <p className="mt-1 text-sm text-red-600">{imageUrlError}</p>
          )}
        </div>
        
        <button
          onClick={downloadImage}
          disabled={loading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Téléchargement en cours...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Télécharger et associer l'image
            </>
          )}
        </button>
        
        <div className="mt-2 text-sm text-gray-500">
          <p>Télécharge l'image depuis l'URL et l'associe au cours. L'image sera stockée localement sur le serveur.</p>
        </div>
      </div>
    </div>
  );
}
