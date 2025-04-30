'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StripeCheckoutFormProps {
  courseId: string;
  courseTitle: string;
  price: number;
  userId: string;
}

export default function StripeCheckoutForm({
  courseId,
  courseTitle,
  price,
  userId,
}: StripeCheckoutFormProps) {
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [freeAccessGranted, setFreeAccessGranted] = useState(false);
  
  // Function to format card number with spaces
  const formatCardNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };
  
  // Function to format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length > 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };
  
  // Function to validate form
  const validateForm = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Numéro de carte invalide');
      return false;
    }
    
    if (!expiryDate.trim() || expiryDate.length < 5) {
      setError('Date d\'expiration invalide');
      return false;
    }
    
    if (!cvc.trim() || cvc.length < 3) {
      setError('CVC invalide');
      return false;
    }
    
    if (!cardholderName.trim()) {
      setError('Nom du titulaire de la carte requis');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Function to apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setError('Veuillez entrer un code promo');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
          courseId: courseId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }
      
      // Si le code est valide et donne un accès gratuit
      if (data.success) {
        setDiscountApplied(100);
        setDiscountMessage(data.message || 'Code promo validé avec succès !');
        setFreeAccessGranted(true);
        
        // Rediriger automatiquement vers la page "Mes formations" avec accès au contenu après 3 secondes
        setTimeout(() => {
          router.push(`/my-courses/${data.courseId}`);
        }, 3000);
      } else {
        // Cas où le message est positif mais pas d'accès libre
        setDiscountMessage(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Code promo invalide');
      setDiscountApplied(0);
      setDiscountMessage(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate final price after discount
  const finalPrice = price * (1 - discountApplied / 100);
  
  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation of Stripe payment
      // In a real app, this would interact with Stripe API
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Make API call to add course to user's purchases
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          paymentDetails: {
            amount: finalPrice,
            discount: discountApplied,
            promoCode: discountApplied > 0 ? promoCode : null,
            paymentMethod: 'card',
            cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
          },
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue lors du paiement');
      }
      
      // Redirect to course page on success
      router.push(`/courses/${courseId}?purchase=success`);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {discountMessage && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded animate-pulse">
          <p>{discountMessage}</p>
          {freeAccessGranted && (
            <p className="mt-2 font-semibold">Vous allez être redirigé vers votre cours...</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-2">Résumé de la commande</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">{courseTitle}</span>
            <span className="text-gray-900 font-medium">{price} €</span>
          </div>
          
          {discountApplied > 0 && (
            <div className="flex justify-between mt-2 text-green-600">
              <span>Remise ({discountApplied}%)</span>
              <span>-{(price * discountApplied / 100).toFixed(2)} €</span>
            </div>
          )}
          
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-900 font-medium">Total</span>
            <span className="text-blue-600 font-bold text-xl">{finalPrice.toFixed(2)} €</span>
          </div>
        </div>
        
        {/* Promo code */}
        <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700">
            Vous avez un code promo ?
          </label>
          <div className="mt-2 flex">
            <input
              type="text"
              id="promo-code"
              name="promo-code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code promo"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading || freeAccessGranted}
            />
            <button
              type="button"
              onClick={applyPromoCode}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                isLoading || freeAccessGranted 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={isLoading || freeAccessGranted}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                'Appliquer'
              )}
            </button>
          </div>
        </div>
        
        {/* Montrer le formulaire de paiement seulement si le code n'est pas valide à 100% */}
        {!freeAccessGranted && (
          <>
            {/* Card holder name */}
            <div>
              <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700">
                Nom du titulaire de la carte
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="cardholder-name"
                  name="cardholder-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            {/* Card number */}
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                Numéro de carte
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="card-number"
                  name="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Image
                    src="/images/card-brands.png"
                    alt="Card brands"
                    width={60}
                    height={20}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Expiry date */}
              <div>
                <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
                  Date d'expiration
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="expiry-date"
                    name="expiry-date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              {/* CVC */}
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit button */}
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  `Payer ${finalPrice.toFixed(2)} €`
                )}
              </button>
            </div>
          </>
        )}
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Paiement 100% sécurisé. Vos informations sont protégées.
        </p>
        <div className="mt-2 flex justify-center space-x-2">
          <svg className="h-8 w-auto text-gray-400" viewBox="0 0 36 24" fill="currentColor">
            <path d="M8 1.527C3.84 1.527.5 4.929.5 9.115v5.77c0 4.186 3.34 7.588 7.5 7.588h20c4.16 0 7.5-3.402 7.5-7.589v-5.77c0-4.185-3.34-7.587-7.5-7.587H8z" fill="#E6EBF1"></path>
            <path d="M19.675 10.203l-1.12 5.237h-1.783l1.12-5.237h1.783zm7.48 3.378c.744 0 1.355-.156 1.834-.316l.224 1.39c-.533.243-1.235.41-2.09.41-1.678 0-2.847-.897-2.847-2.288 0-1.892 2.046-2.994 4.414-2.994.58 0 1.235.092 1.77.27l-.223 1.36a6.131 6.131 0 00-1.547-.213c-1.19 0-2.555.38-2.555 1.424 0 .608.446 1.018 1.337 1.018h-.316zm-11.29-3.378l-.275 1.66.042-.061c.5-.73 1.234-1.05 2.09-1.05.892 0 1.462.38 1.462 1.115 0 .152-.21.425-.42.837l-.765 3.623h-1.783l.743-3.5a2.349 2.349 0 00.063-.395c0-.274-.17-.456-.532-.456-.457 0-.882.274-1.156.73l-.85 3.621h-1.782l1.205-5.67 1.57.546zm-3.19 1.21c0 .79-.5 1.33-1.286 1.33-.616 0-.935-.41-.935-.912 0-.79.53-1.328 1.294-1.328.637 0 .935.39.935.91h-.008zm-2.408 2.59c0-1.117.786-1.628 2.472-1.75-.02-.243-.19-.486-.637-.486-.34 0-.68.092-1.028.244l-.286-1.175c.456-.183 1.113-.335 1.76-.335 1.34 0 1.974.65 1.974 1.963 0 .273-.42.576-.106.97l-.51 2.44-1.57-.06.17-.486c-.34.365-.808.608-1.402.608-.765-.001-1.34-.547-1.34-1.323l.003-.61zm2.248-.213c.723-.075 1.05-.35 1.113-.82.01-.061.01-.122.01-.183 0-.214-.148-.365-.467-.365-.51 0-.903.425-.921 1.13l.265.238zm16.56-2.377c0 .79-.5 1.33-1.287 1.33-.616 0-.935-.41-.935-.912 0-.79.53-1.328 1.294-1.328.638 0 .935.39.935.91h-.007zm-2.407 2.59c0-1.117.786-1.628 2.472-1.75-.021-.243-.19-.486-.638-.486-.34 0-.68.092-1.028.244l-.286-1.175c.457-.183 1.113-.335 1.76-.335 1.34 0 1.975.65 1.975 1.963 0 .273-.43.576-.106.97l-.51 2.44-1.57-.06.169-.486c-.34.365-.807.608-1.401.608-.765-.001-1.34-.547-1.34-1.323l.003-.61zm2.248-.213c.723-.075 1.05-.35 1.113-.82.01-.061.01-.122.01-.183 0-.214-.148-.365-.467-.365-.51 0-.903.425-.921 1.13l.265.238z"></path>
          </svg>
          <svg className="h-8 w-auto text-gray-400" viewBox="0 0 36 24" fill="currentColor">
            <path d="M4 1h28a4 4 0 014 4v14a4 4 0 01-4 4H4a4 4 0 01-4-4V5a4 4 0 014-4z" fill="#D80027"></path>
            <path d="M19.644 15.455h-3.288L18 9.09l1.644 6.364zM14.135 6.924v.695h5.73v-.695h-5.73zm.015 1.356L13 15.455h1.909l.245-.942h3.692l.245.942h1.909L19.85 8.28h-5.7z" fill="#FFDA44"></path>
            <path d="M20.673 7.664v-.74h-5.344v.74h5.344zm-6.538 5.53h1.909l.245-.941h3.692l.245.942h1.909L20.98 6.184h-5.7l-1.145 7.01z" fill="#FFDA44"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
