'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PromoCodeInput() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | null}>({text: '', type: null});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({text: '', type: null});
    
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({text: data.message, type: 'success'});
        router.refresh(); // Refresh course list
      } else {
        setMessage({text: data.error, type: 'error'});
      }
    } catch (error) {
      setMessage({text: 'Erreur réseau', type: 'error'});
    } finally {
      setIsLoading(false);
      setCode('');
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Utiliser un code promo</h3>
      <p className="text-gray-600 mb-4">Entrez votre code promo pour débloquer une formation</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="LASER2025"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full md:w-auto"
          >
            {isLoading ? 'Vérification...' : 'Activer'}
          </button>
        </div>
        
        {message.text && (
          <div className={`mt-3 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
