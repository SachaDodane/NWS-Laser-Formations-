'use client';

import { useEffect } from 'react';

const ScrollAnimations = () => {
  // Fonction pour initialiser l'effet parallaxe
  const initParallax = () => {
    const parallaxElements = document.querySelectorAll('.parallax-scroll');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach((element: Element) => {
        const speed = 0.2;
        const valueY = scrollY * speed;
        
        (element as HTMLElement).style.setProperty('--parallax-speed', `${valueY}px`);
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  };
  
  // Fonction pour animer les éléments au défilement
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.fade-in-section');
    
    const checkIfInView = () => {
      const windowHeight = window.innerHeight;
      const windowTopPosition = window.scrollY;
      const windowBottomPosition = (windowTopPosition + windowHeight);
      
      revealElements.forEach((element: Element) => {
        const elementHeight = element.clientHeight;
        const elementTopPosition = element.getBoundingClientRect().top + windowTopPosition;
        const elementBottomPosition = (elementTopPosition + elementHeight);
        
        // Vérifier si l'élément est dans la zone visible
        if ((elementBottomPosition >= windowTopPosition) && 
            (elementTopPosition <= windowBottomPosition - 100)) {
          element.classList.add('is-visible');
        }
      });
    };
    
    window.addEventListener('scroll', checkIfInView);
    window.addEventListener('resize', checkIfInView);
    
    // Vérifier dès le chargement de la page
    checkIfInView();
    
    return () => {
      window.removeEventListener('scroll', checkIfInView);
      window.removeEventListener('resize', checkIfInView);
    };
  };
  
  useEffect(() => {
    const cleanupParallax = initParallax();
    const cleanupScrollReveal = initScrollReveal();
    
    return () => {
      cleanupParallax();
      cleanupScrollReveal();
    };
  }, []);
  
  return null;
};

export default ScrollAnimations;
