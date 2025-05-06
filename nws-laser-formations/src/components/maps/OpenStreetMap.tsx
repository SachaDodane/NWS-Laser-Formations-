'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  popupText?: string;
  address?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  popupText,
  address
}) => {
  const mapInitialized = useRef(false);

  // Initialiser la carte quand les scripts sont chargés
  useEffect(() => {
    // Fonction pour initialiser la carte
    const initMap = () => {
      // Vérifie si Leaflet est chargé et si la carte n'a pas déjà été initialisée
      if (typeof window !== 'undefined' && window.L && !mapInitialized.current) {
        try {
          // S'assurer que l'élément existe
          const mapElement = document.getElementById('osm-map');
          
          if (!mapElement) {
            console.error('Élément de carte non trouvé');
            return;
          }
          
          // Initialisation de la carte
          const map = window.L.map('osm-map').setView([latitude, longitude], zoom);
          
          // Ajout de la couche OpenStreetMap
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          // Ajout du marqueur
          const marker = window.L.marker([latitude, longitude]).addTo(map);
          
          // Ajouter un popup si du texte est fourni
          if (popupText) {
            marker.bindPopup(popupText).openPopup();
          }
          
          // Marquer comme initialisé
          mapInitialized.current = true;
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de la carte:', error);
        }
      } else {
        // Si Leaflet n'est pas encore chargé, réessayer après un délai
        setTimeout(initMap, 500);
      }
    };
    
    // Lancer l'initialisation
    initMap();
    
    // Nettoyage à la désinstallation du composant
    return () => {
      mapInitialized.current = false;
    };
  }, [latitude, longitude, zoom, popupText]);

  return (
    <>
      {/* Container pour la carte */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden">
        <div id="osm-map" className="absolute inset-0 z-0"></div>

        {/* Lien d'attribution OpenStreetMap */}
        <div className="absolute bottom-0 right-0 bg-white bg-opacity-70 px-2 py-1 text-xs z-10">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a> contributors
        </div>
      </div>
      
      {/* Boutons alternatifs pour la carte */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
          </svg>
          Voir sur OpenStreetMap
        </a>
        
        <a 
          href={address 
            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` 
            : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Itinéraire Google Maps
        </a>
      </div>
      
      {/* Scripts pour Leaflet */}
      <Script
        id="leaflet-css"
        strategy="beforeInteractive"
      >
        {`
          if (typeof window !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
          }
        `}
      </Script>
      
      <Script
        id="leaflet-js"
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="afterInteractive"
      />
    </>
  );
};

export default OpenStreetMap;
