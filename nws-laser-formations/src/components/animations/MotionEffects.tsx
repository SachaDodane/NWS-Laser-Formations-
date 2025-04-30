'use client';

import React, { useEffect, useRef, useState } from 'react';

type FadeInProps = {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
};

type CounterProps = {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

// Fade-in animation component with direction
export function FadeIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.5,
  className = ''
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // In case there are multiple entries, we only need the first one
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        // Once it's visible, we don't need to observe it anymore
        if (domRef.current) observer.unobserve(domRef.current);
      }
    });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);
  
  // Define transform values based on direction
  const transformValue = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  }[direction];
  
  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0)' : transformValue,
    transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
    transitionDelay: `${delay}s`,
  };
  
  return (
    <div ref={domRef} style={style} className={className}>
      {children}
    </div>
  );
}

// Animated counter component
export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  className = ''
}: CounterProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        startAnimation();
        if (counterRef.current) observer.unobserve(counterRef.current);
      }
    });
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) observer.unobserve(counterRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end]);
  
  const startAnimation = () => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      
      const progressPercent = Math.min(progress / duration, 1);
      // Using easeOutQuint for a nice easing effect
      const easedProgress = 1 - Math.pow(1 - progressPercent, 5);
      
      setCount(Math.floor(easedProgress * end));
      
      if (progressPercent < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end at exactly the target number
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
  };
  
  return (
    <div ref={counterRef} className={className}>
      {prefix}{count}{suffix}
    </div>
  );
}

// Hover effect card
export function HoverCard({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div 
      className={`transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}

// Pulsing effect for buttons or elements that need attention
export function PulseEffect({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
      <div className="relative">{children}</div>
    </div>
  );
}

// Text reveal animation
export function TextReveal({ 
  text, 
  className = '' 
}: {
  text: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        if (textRef.current) observer.unobserve(textRef.current);
      }
    });
    
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    
    return () => {
      if (textRef.current) observer.unobserve(textRef.current);
    };
  }, []);
  
  // Split the text into characters and create spans
  const textArray = text.split('');
  
  return (
    <div ref={textRef} className={className}>
      <div className="overflow-hidden">
        {textArray.map((char, index) => (
          <span 
            key={index}
            className="inline-block"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: `opacity 0.5s ease, transform 0.5s ease`,
              transitionDelay: `${index * 0.03}s`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
}

// Loading spinner with customizable color and size
export function LoadingSpinner({
  size = 'md', 
  color = 'blue'
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
}) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];
  
  const colorClass = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  }[color];
  
  return (
    <svg 
      className={`animate-spin ${sizeClass} ${colorClass}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

// Wave animation for text or logo
export function WaveText({ 
  text, 
  className = '' 
}: {
  text: string;
  className?: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Split the text into characters
  const letters = text.split('');
  
  return (
    <div 
      className={`inline-block ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {letters.map((letter, index) => (
        <span 
          key={index}
          className="inline-block transition-transform"
          style={{
            transform: isHovering ? `translateY(-${Math.sin((index * Math.PI) / 4) * 5}px)` : 'translateY(0)',
            transitionDelay: `${index * 0.05}s`,
            transitionDuration: '0.3s',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </div>
  );
}

// Gradient button with hover effect
export function GradientButton({ 
  children, 
  onClick, 
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md group ${className}`}
    >
      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 group-hover:opacity-100"></span>
      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out bg-gradient-to-br from-blue-500 to-blue-600"></span>
      <span className="relative">{children}</span>
      <span className="absolute bottom-0 right-0 w-8 h-8 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-0 bg-white opacity-10 group-hover:translate-x-1 group-hover:translate-y-1"></span>
    </button>
  );
}

// Blinking cursor effect for typing animation
export function TypedText({ 
  text, 
  speed = 50, 
  className = '' 
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);
  
  return (
    <div className={className}>
      {displayedText}
      <span className="inline-block w-1 h-5 ml-1 bg-blue-600 animate-pulse"></span>
    </div>
  );
}
