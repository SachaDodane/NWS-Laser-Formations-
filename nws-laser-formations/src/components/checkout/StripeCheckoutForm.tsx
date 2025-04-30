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
  const applyPromoCode = () => {
    // Demo promo codes for the mock system
    if (promoCode === 'PROMO20') {
      setDiscountApplied(20);
      setDiscountMessage('Remise de 20% appliquée');
    } else if (promoCode === 'PROMO50') {
      setDiscountApplied(50);
      setDiscountMessage('Remise de 50% appliquée');
    } else if (promoCode === 'FREE100') {
      setDiscountApplied(100);
      setDiscountMessage('Formation gratuite! Code de réduction 100% appliqué');
    } else {
      setError('Code promo invalide');
      setDiscountApplied(0);
      setDiscountMessage(null);
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
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {discountMessage && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{discountMessage}</p>
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
        <div>
          <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700">
            Code promo
          </label>
          <div className="mt-1 flex">
            <input
              type="text"
              id="promo-code"
              name="promo-code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code promo"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={applyPromoCode}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Appliquer
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Essayez les codes : PROMO20, PROMO50, FREE100
          </p>
        </div>
        
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
            <div className="mt-1">
              <input
                type="text"
                id="cvc"
                name="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="123"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              `Payer ${finalPrice.toFixed(2)} €`
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>
            Ceci est un simulateur de paiement. Aucune transaction réelle ne sera effectuée.
          </p>
          <p className="mt-1">
            Pour tester, utilisez le numéro de carte 4242 4242 4242 4242 avec n'importe quelle date future et CVC.
          </p>
        </div>
      </form>
    </div>
  );
}
