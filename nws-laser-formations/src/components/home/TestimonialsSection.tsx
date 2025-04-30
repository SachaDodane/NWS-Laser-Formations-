'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Interface pour les témoignages
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

// Données de témoignages
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marie Dupont",
    role: "Ingénieure Laser",
    company: "TechLaser Industries",
    content: "La formation sur la sécurité laser a complètement transformé ma façon de travailler. Les connaissances acquises m'ont permis de mettre en place des protocoles bien plus sûrs dans mon entreprise.",
    rating: 5,
    avatar: "/images/testimonials/avatar1.jpg"
  },
  {
    id: 2,
    name: "Jean Martin",
    role: "Technicien médical",
    company: "Hôpital Universitaire",
    content: "J'ai suivi la formation sur les applications médicales du laser et je suis impressionné par la qualité du contenu. Les vidéos et exercices pratiques sont particulièrement bien conçus.",
    rating: 4,
    avatar: "/images/testimonials/avatar2.jpg"
  },
  {
    id: 3,
    name: "Sophie Lefebvre",
    role: "Directrice R&D",
    company: "OptoTech",
    content: "Notre équipe entière a bénéficié de cette formation. Le format en ligne nous a permis de nous former à notre rythme tout en maintenant notre activité. Je recommande vivement !",
    rating: 5,
    avatar: "/images/testimonials/avatar3.jpg"
  },
  {
    id: 4,
    name: "Thomas Bernard",
    role: "Entrepreneur",
    company: "LaserCut Pro",
    content: "En tant que créateur d'entreprise dans le domaine de la découpe laser, cette plateforme m'a fourni toutes les connaissances nécessaires pour démarrer mon activité en toute sécurité.",
    rating: 5,
    avatar: "/images/testimonials/avatar4.jpg"
  }
];

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Effet pour faire défiler les témoignages automatiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Effet pour l'animation d'entrée
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fonction pour générer les étoiles de notation
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg 
        key={i}
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Gestionnaires pour la navigation
  const handlePrev = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${isVisible ? 'fadeIn' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce que disent nos apprenants</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les retours d'expérience de nos apprenants satisfaits qui ont transformé leur carrière grâce à nos formations.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Contrôles de navigation */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -ml-4 md:-ml-6"
            aria-label="Témoignage précédent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -mr-4 md:-mr-6"
            aria-label="Témoignage suivant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Conteneur principal du carrousel */}
          <div className="overflow-hidden bg-white rounded-xl shadow-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="min-w-full p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center"
                >
                  {/* Avatar et info */}
                  <div className="flex flex-col items-center md:items-start">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 mb-4 overflow-hidden rounded-full border-4 border-blue-100 shadow-inner">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                    <p className="text-gray-500 mb-3">{testimonial.company}</p>
                    <div className="flex mb-4">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  
                  {/* Contenu du témoignage */}
                  <div className="flex-1">
                    <svg className="h-10 w-10 text-blue-200 mb-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M14 0H4v12h6.5c0 4-3.5 6.5-8.5 7V25c9-2 14-9 14-17.5V0ZM30 0H20v12h6.5c0 4-3.5 6.5-8.5 7V25c9-2 14-9 14-17.5V0Z"/>
                    </svg>
                    <p className="text-lg text-gray-700 italic mb-4">{testimonial.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicateurs de position */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === currentTestimonial ? 'w-8 bg-blue-600' : 'w-2.5 bg-blue-200'
                }`}
                aria-label={`Voir témoignage ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
