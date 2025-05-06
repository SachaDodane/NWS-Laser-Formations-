'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface GoogleMapProps {
  apiKey: string;
  address: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
}

// Déclaration pour l'API Google Maps
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  address,
  latitude,
  longitude,
  zoom = 15,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  // Initialise la carte une fois que le script Google Maps est chargé
  const initializeMap = () => {
    if (!window.google || !mapRef.current || mapInitialized.current) return;
    
    try {
      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      };
      
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Ajouter un marqueur
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: 'NWS Laser Formations',
        animation: window.google.maps.Animation.DROP
      });
      
      // Ajouter une fenêtre d'info
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 300px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">NWS Laser Formations</h3>
            <p style="margin: 0; font-size: 14px;">${address}</p>
          </div>
        `
      });
      
      // Ouvrir l'info window quand on clique sur le marqueur
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      // Ouvrir l'info window par défaut
      infoWindow.open(map, marker);
      
      mapInitialized.current = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Google Maps:', error);
    }
  };

  // Définit la fonction d'initialisation sur l'objet window pour le callback Google Maps
  useEffect(() => {
    window.initMap = initializeMap;
    
    // Nettoyer
    return () => {
      mapInitialized.current = false;
    };
  }, [latitude, longitude, zoom]);

  return (
    <div className="google-map-container">
      <div 
        ref={mapRef} 
        id="google-map" 
        className="rounded-lg overflow-hidden w-full" 
        style={{ height }}
      ></div>
      
      {/* Script pour l'API Google Maps */}
      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly`}
        strategy="afterInteractive"
        onError={() => console.error('Erreur lors du chargement de Google Maps')}
      />
      
      {/* Liens alternatifs */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
          </svg>
          Voir sur Google Maps
        </a>
        
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Itinéraire
        </a>
      </div>
    </div>
  );
};

export default GoogleMap;
