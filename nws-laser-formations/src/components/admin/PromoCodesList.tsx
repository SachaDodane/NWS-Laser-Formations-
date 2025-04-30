'use client';

import { useState } from 'react';

interface PromoCode {
  _id: string;
  code: string;
  discount: number;
  isFreePass: boolean;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  courseId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
}

interface PromoCodesListProps {
  initialCodes: PromoCode[];
  courses: Course[];
}

export default function PromoCodesList({ initialCodes, courses }: PromoCodesListProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialCodes);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state for creating a new promo code
  const [newCode, setNewCode] = useState({
    code: '',
    discount: 20,
    isFreePass: false,
    maxUses: 10,
    isActive: true,
    courseId: null,
    expiresAt: ''
  });
  
  // Function to generate a random code
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setNewCode({
      ...newCode,
      code: result
    });
  };
  
  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewCode({
        ...newCode,
        [name]: checked,
        // If it's a free pass, set discount to 100%
        ...(name === 'isFreePass' && checked ? { discount: 100 } : {})
      });
    } else if (name === 'discount') {
      // Ensure discount is between 0 and 100
      const discount = Math.min(100, Math.max(0, parseInt(value) || 0));
      setNewCode({
        ...newCode,
        [name]: discount
      });
    } else if (name === 'maxUses') {
      // Ensure maxUses is at least 1
      const maxUses = Math.max(1, parseInt(value) || 1);
      setNewCode({
        ...newCode,
        [name]: maxUses
      });
    } else {
      setNewCode({
        ...newCode,
        [name]: value
      });
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCode.code.trim()) {
      setError('Le code promo est requis');
      return;
    }
    
    if (newCode.discount <= 0 && !newCode.isFreePass) {
      setError('La réduction doit être supérieure à 0%');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCode),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }
      
      const data = await response.json();
      
      // Add the new code to the list
      setPromoCodes([
        {
          _id: data._id,
          ...newCode,
          currentUses: 0,
          expiresAt: newCode.expiresAt || 'Pas de date d\'expiration',
          createdAt: new Date().toLocaleDateString(),
        },
        ...promoCodes
      ]);
      
      // Reset form and show success message
      setNewCode({
        code: '',
        discount: 20,
        isFreePass: false,
        maxUses: 10,
        isActive: true,
        courseId: null,
        expiresAt: ''
      });
      setIsCreating(false);
      
      setSuccessMessage('Code promo créé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to toggle code activation
  const toggleCodeActivation = async (codeId: string, isCurrentlyActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${codeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isCurrentlyActive
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }
      
      // Update local state
      setPromoCodes(promoCodes.map(code => 
        code._id === codeId 
          ? { ...code, isActive: !isCurrentlyActive } 
          : code
      ));
      
      setSuccessMessage(`Code promo ${isCurrentlyActive ? 'désactivé' : 'activé'} avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };
  
  // Function to delete a promo code
  const deletePromoCode = async (codeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/promo-codes/${codeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }
      
      // Remove from local state
      setPromoCodes(promoCodes.filter(code => code._id !== codeId));
      
      setSuccessMessage('Code promo supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };
  
  return (
    <div>
      {/* Success and error messages */}
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
      
      {/* Action buttons */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Codes promotionnels</h2>
        
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isCreating ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouveau code promo
            </>
          )}
        </button>
      </div>
      
      {/* Form for creating a new promo code */}
      {isCreating && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un code promo</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code promo
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={newCode.code}
                    onChange={handleInputChange}
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="ex: PROMO20"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Générer
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                  Réduction (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={newCode.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  disabled={newCode.isFreePass}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
                  Nombre d'utilisations max
                </label>
                <input
                  type="number"
                  id="maxUses"
                  name="maxUses"
                  value={newCode.maxUses}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={newCode.expiresAt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                  Cours associé
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={newCode.courseId || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Aucun</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="isFreePass"
                name="isFreePass"
                type="checkbox"
                checked={newCode.isFreePass}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFreePass" className="ml-2 block text-sm text-gray-900">
                Code d'accès gratuit (100% de réduction)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={newCode.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Actif immédiatement
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  'Créer le code'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Table of promo codes */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Réduction
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisations
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours associé
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promoCodes.map((code) => (
              <tr key={code._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{code.code}</div>
                  <div className="text-sm text-gray-500">Créé le {code.createdAt}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {code.isFreePass ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Accès gratuit (100%)
                    </span>
                  ) : (
                    <span className="text-sm text-gray-900">{code.discount}%</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {code.currentUses} / {code.maxUses}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{code.expiresAt}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {code.courseId ? (
                      courses.find(course => course._id === code.courseId)?.title
                    ) : (
                      'Aucun'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    code.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {code.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleCodeActivation(code._id, code.isActive)}
                    className={`mr-2 text-sm ${
                      code.isActive
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {code.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => deletePromoCode(code._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Aucun code promo trouvé. Créez-en un !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
