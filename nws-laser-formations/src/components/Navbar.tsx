'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Vérifier si le lien actuel est actif
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Client-side only
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Vérification initiale
    }

    return () => {
      // Client-side only
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <nav className={`bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-1' : 'py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                <div className={`transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                  <span className="text-xl font-bold text-blue-600">
                    NWS Laser
                  </span>
                  <span className="text-lg font-medium text-gray-700 ml-1">
                    Formations
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/courses"
                className={`nav-link px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive('/courses')
                    ? 'bg-blue-100 text-blue-700 active' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Formations
              </Link>
              
              {session?.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`nav-link px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-100 text-blue-700 active' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </Link>
              )}
              
              {session ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/my-courses"
                    className={`nav-link px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive('/my-courses')
                        ? 'bg-blue-100 text-blue-700 active' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mes formations
                  </Link>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="nav-link menu-button-hover px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="nav-link menu-button-hover px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="menu-button-hover px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="menu-button-hover inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Ouvrir le menu</span>
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-4 space-y-1 bg-white">
              <Link
                href="/courses"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Formations
              </Link>
              
              {session?.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Administration
                </Link>
              )}
              
              {session ? (
                <>
                  <Link
                    href="/my-courses"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes formations
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-blue-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer pour le contenu principal */}
      <div className="h-16"></div>
    </>
  );
}
