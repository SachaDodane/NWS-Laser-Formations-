'use client';

import { useEffect, useState, useRef } from 'react';

interface TypewriterTextProps {
  lines: string[];
  speed?: number;
  className?: string;
}

const TypewriterText = ({ lines, speed = 70, className = '' }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState<string[]>(Array(lines.length).fill(''));
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTyping) return;

    // Si nous avons terminé toutes les lignes
    if (currentLine >= lines.length) {
      setIsTyping(false);
      return;
    }

    // Si nous avons terminé la ligne actuelle
    if (currentChar >= lines[currentLine].length) {
      // Ajout d'un délai un peu plus long entre les lignes
      const timeout = setTimeout(() => {
        setCurrentLine(currentLine + 1);
        setCurrentChar(0);
      }, speed * 3);
      
      return () => clearTimeout(timeout);
    }

    // Ajouter le caractère suivant à la ligne actuelle
    const timeout = setTimeout(() => {
      setDisplayText(prev => {
        const newText = [...prev];
        newText[currentLine] = lines[currentLine].substring(0, currentChar + 1);
        return newText;
      });
      setCurrentChar(currentChar + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentChar, currentLine, isTyping, lines, speed]);

  return (
    <div className={`typewriter-container ${className}`} ref={containerRef}>
      {displayText.map((text, index) => (
        <div key={index} className="typewriter-line">
          {text}
        </div>
      ))}
    </div>
  );
};

export default TypewriterText;
