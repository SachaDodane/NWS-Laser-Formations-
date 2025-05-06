import React, { useState, useEffect } from 'react';

interface HoneypotFieldProps {
  className?: string;
}

/**
 * Champ honeypot pour détecter les robots de spam
 * Ce champ est caché visuellement pour les humains mais visible pour les robots
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({ className }) => {
  return (
    <div 
      className={`${className || ''}`} 
      style={{ 
        opacity: 0, 
        position: 'absolute', 
        top: -9999, 
        left: -9999, 
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <label htmlFor="subject">Sujet (ne pas remplir)</label>
      <input
        type="text"
        id="subject"
        name="subject"
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
};

interface TimeTrackingProps {
  onTimeValid: (isValid: boolean) => void;
  minTimeSeconds?: number;
}

/**
 * Composant qui vérifie le temps passé sur le formulaire
 * Pour détecter les soumissions automatisées (trop rapides)
 */
export const TimeTracking: React.FC<TimeTrackingProps> = ({ 
  onTimeValid, 
  minTimeSeconds = 3 
}) => {
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    const checkTime = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const isValid = elapsedSeconds >= minTimeSeconds;
      onTimeValid(isValid);
    };

    // Vérifier le temps initial
    checkTime();

    // Configurer une vérification périodique
    const interval = setInterval(checkTime, 1000);
    
    return () => clearInterval(interval);
  }, [onTimeValid, startTime, minTimeSeconds]);

  return null;
};

interface CaptchaProps {
  onChange: (value: string) => void;
}

/**
 * Captcha simple intégré (pas de dépendance externe)
 */
export const SimpleCaptcha: React.FC<CaptchaProps> = ({ onChange }) => {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  
  // Générer un nouveau captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    onChange('');
  };

  // Gérer les changements de saisie utilisateur
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    onChange(value === captchaText ? value : '');
  };

  // Générer un captcha au chargement initial
  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="flex flex-col space-y-3">
        <div 
          className="p-3 bg-gray-100 text-center relative"
          style={{
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            letterSpacing: '0.25rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
            borderRadius: '0.375rem',
            userSelect: 'none'
          }}
        >
          {/* Appliquer des distorsions au texte pour le rendre plus difficile à OCR */}
          {captchaText.split('').map((char, index) => (
            <span 
              key={index}
              style={{
                display: 'inline-block',
                transform: `rotate(${Math.random() * 10 - 5}deg) translateY(${Math.random() * 6 - 3}px)`,
                color: `hsl(${Math.random() * 240}, 70%, 50%)`,
              }}
            >
              {char}
            </span>
          ))}
          <button
            type="button"
            onClick={generateCaptcha}
            className="absolute right-2 top-2 text-sm text-blue-600 hover:text-blue-800"
            aria-label="Régénérer le captcha"
          >
            ↻
          </button>
        </div>
        
        <div className="flex flex-col space-y-1">
          <label htmlFor="captcha" className="text-sm font-medium text-gray-700">
            Saisissez le texte affiché ci-dessus
          </label>
          <input
            id="captcha"
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Saisissez le code"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

interface SpamProtectionProps {
  children: React.ReactNode;
  onValidationChange: (isValid: boolean) => void;
  enableCaptcha?: boolean;
  enableTimeTracking?: boolean;
  minTimeSeconds?: number;
}

/**
 * Composant principal de protection anti-spam
 * Combine honeypot, time tracking et captcha optionnel
 */
const SpamProtection: React.FC<SpamProtectionProps> = ({
  children,
  onValidationChange,
  enableCaptcha = false,
  enableTimeTracking = true,
  minTimeSeconds = 3
}) => {
  const [timeValid, setTimeValid] = useState<boolean>(false);
  const [captchaValid, setCaptchaValid] = useState<boolean>(!enableCaptcha);
  
  // Mettre à jour la validation globale lorsque les éléments individuels changent
  useEffect(() => {
    const isValid = timeValid && captchaValid;
    onValidationChange(isValid);
  }, [timeValid, captchaValid, onValidationChange]);

  return (
    <div className="spam-protection">
      <HoneypotField />
      
      {enableTimeTracking && (
        <TimeTracking
          onTimeValid={setTimeValid}
          minTimeSeconds={minTimeSeconds}
        />
      )}
      
      {enableCaptcha && (
        <SimpleCaptcha
          onChange={(value) => setCaptchaValid(!!value)}
        />
      )}
      
      {children}
    </div>
  );
};

export default SpamProtection;
