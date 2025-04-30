'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function AdminActions() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const assignAllCourses = async () => {
    if (!confirm('Êtes-vous sûr de vouloir ajouter toutes les formations à votre compte ? Cela vous donnera accès à toutes les formations actuelles.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/assign-all-courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }

      const data = await response.json();
      
      toast.success(data.message || 'Toutes les formations ont été ajoutées à votre compte avec succès');
      
      // Rafraîchir la page pour voir les changements
      router.refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'attribution des formations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Actions administrateur</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Accès aux formations</h3>
          <p className="text-blue-700 mb-3">
            En tant qu'administrateur, vous pouvez obtenir automatiquement l'accès à toutes les formations 
            disponibles sur la plateforme pour pouvoir les consulter et les tester.
          </p>
          
          <button
            onClick={assignAllCourses}
            disabled={isLoading}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Attribution en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                M'attribuer toutes les formations
              </>
            )}
          </button>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Gestion des codes promo</h3>
          <p className="text-purple-700 mb-3">
            Créez et gérez des codes promotionnels pour offrir des réductions à vos clients ou 
            proposer des formations gratuites avec des passes d'accès.
          </p>
          
          <a 
            href="/admin/promo-codes"
            className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-all transform hover:scale-105 duration-200 w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Gérer les codes promo
          </a>
        </div>
      </div>
    </div>
  );
}
