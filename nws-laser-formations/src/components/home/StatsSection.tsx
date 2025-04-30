'use client';

import { useState, useEffect, useRef } from 'react';
import { ReactNode } from 'react';

interface StatItem {
  id: number;
  value: number;
  suffix: string;
  label: string;
  icon: ReactNode;
  duration: number;
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Statistiques à afficher
  const stats: StatItem[] = [
    {
      id: 1,
      value: 1500,
      suffix: '+',
      label: 'Apprenants Formés',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      duration: 2000
    },
    {
      id: 2,
      value: 98,
      suffix: '%',
      label: 'Taux de Satisfaction',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      duration: 2500
    },
    {
      id: 3,
      value: 25,
      suffix: '+',
      label: 'Formations Disponibles',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      duration: 3000
    },
    {
      id: 4,
      value: 95,
      suffix: '%',
      label: 'Taux de Réussite',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      duration: 2800
    }
  ];

  // Effet pour déclencher l'animation quand la section est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Composant AnimatedCounter pour l'animation de comptage
  const AnimatedCounter = ({ item }: { item: StatItem }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isVisible) return;

      let startTime: number;
      let animationFrameId: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / item.duration, 1);
        
        // Easing function pour rendre l'animation plus naturelle
        const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
        const easedProgress = easeOutQuart(percentage);
        
        setCount(Math.floor(easedProgress * item.value));

        if (percentage < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [isVisible, item]);

    return (
      <div className="text-4xl md:text-5xl font-bold text-blue-800" ref={countRef}>
        {count}{item.suffix}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-blue-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            NWS Laser Formations en chiffres
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez l'impact de notre plateforme et rejoignez notre communauté d'apprenants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className={`bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${stat.id * 100}ms` }}
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              {isVisible ? <AnimatedCounter item={stat} /> : <div className="text-4xl md:text-5xl font-bold text-blue-800">0{stat.suffix}</div>}
              <p className="text-gray-600 mt-2 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
