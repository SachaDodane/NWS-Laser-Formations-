'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
}

export default function PartnersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Liste des partenaires
  const partners: Partner[] = [
    {
      id: 1,
      name: "Institut Laser France",
      logo: "/images/partners/partner1.png",
      description: "L'Institut Laser France est un organisme de référence dans la recherche et les applications industrielles du laser."
    },
    {
      id: 2,
      name: "MedLaser Association",
      logo: "/images/partners/partner2.png",
      description: "Association des professionnels médicaux spécialisés dans les technologies laser et leurs applications."
    },
    {
      id: 3,
      name: "LaserTech Industries",
      logo: "/images/partners/partner3.png",
      description: "Leader européen de la fabrication d'équipements laser pour l'industrie et la recherche."
    },
    {
      id: 4,
      name: "Laser Safety Council",
      logo: "/images/partners/partner4.png",
      description: "Organisation internationale dédiée à l'établissement des normes de sécurité laser."
    },
    {
      id: 5,
      name: "OptoScitech",
      logo: "/images/partners/partner5.png",
      description: "Entreprise spécialisée dans le développement de solutions optiques et laser de précision."
    }
  ];

  // Effet pour détecter quand la section est visible
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

  // Placeholder pour les images qui pourraient ne pas exister
  const placeholderLogos = [
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f4f8'/%3E%3Cpath d='M55 20h90v60H55z' fill='%23dbe4ff'/%3E%3Ctext x='100' y='55' font-family='Arial' font-size='14' text-anchor='middle' fill='%234a6fa5'%3EPartenaire Laser%3C/text%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f4f8'/%3E%3Ccircle cx='100' cy='50' r='30' fill='%23dbe4ff'/%3E%3Ctext x='100' y='55' font-family='Arial' font-size='14' text-anchor='middle' fill='%234a6fa5'%3ELaser Tech%3C/text%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f4f8'/%3E%3Cpolygon points='70,30 130,30 150,50 130,70 70,70 50,50' fill='%23dbe4ff'/%3E%3Ctext x='100' y='55' font-family='Arial' font-size='14' text-anchor='middle' fill='%234a6fa5'%3ELaser Pro%3C/text%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f4f8'/%3E%3Crect x='60' y='30' width='80' height='40' rx='5' fill='%23dbe4ff'/%3E%3Ctext x='100' y='55' font-family='Arial' font-size='14' text-anchor='middle' fill='%234a6fa5'%3ELaser Safety%3C/text%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f4f8'/%3E%3Cellipse cx='100' cy='50' rx='40' ry='20' fill='%23dbe4ff'/%3E%3Ctext x='100' y='55' font-family='Arial' font-size='14' text-anchor='middle' fill='%234a6fa5'%3EOptoTech%3C/text%3E%3C/svg%3E"
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'fadeIn' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos partenaires et certifications
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous collaborons avec les meilleurs acteurs du secteur pour vous offrir des formations de qualité.
          </p>
        </div>

        {/* Logos des partenaires */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {partners.map((partner, index) => (
              <div 
                key={partner.id} 
                className={`bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 transform transition-all duration-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 40vw, 20vw"
                    onError={(e) => {
                      // Fallback pour les images qui ne sont pas trouvées
                      const target = e.target as HTMLImageElement;
                      target.src = placeholderLogos[index % placeholderLogos.length];
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-700 ${
          isVisible ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-10'
        }`}>
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 bg-blue-700 text-white">
              <h3 className="text-2xl font-bold mb-4">Certifications reconnues</h3>
              <p className="mb-6">
                Nos formations sont certifiées par les principales institutions du secteur laser et respectent 
                les normes internationales en matière de sécurité et de qualité.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Certification internationale de sécurité laser
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Accréditation professionnelle laser industriel
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Certification médicale pour applications laser
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Qualification technique européenne
                </li>
              </ul>
            </div>
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi nos certifications font la différence</h3>
              <p className="text-gray-600 mb-6">
                Obtenir une certification par NWS Laser Formations vous garantit une reconnaissance dans l'industrie
                et un avantage concurrentiel sur le marché du travail.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Crédibilité professionnelle</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Démontrez votre expertise et vos compétences auprès de vos employeurs et clients.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Progression de carrière</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Favorisez votre évolution professionnelle et accédez à de nouvelles opportunités.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
