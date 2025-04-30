'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

interface CertificateButtonProps {
  courseId: string;
  courseTitle: string;
  userName: string;
  completionDate: string;
  disabled?: boolean;
}

export default function CertificateButton({
  courseId,
  courseTitle,
  userName,
  completionDate,
  disabled = false
}: CertificateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    if (disabled) {
      toast.info("Vous devez terminer 100% de la formation pour télécharger votre certificat.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/certificate/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseTitle,
          userName,
          completionDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du certificat');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Formattez le nom du fichier
      const sanitizedTitle = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `certificat_${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      a.href = url;
      a.download = fileName;
      a.click();
      
      window.URL.revokeObjectURL(url);
      toast.success("Votre certificat a été téléchargé avec succès !");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la génération du certificat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateCertificate}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transition-colors ${
        disabled 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Génération en cours...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Télécharger mon certificat
        </>
      )}
    </button>
  );
}
