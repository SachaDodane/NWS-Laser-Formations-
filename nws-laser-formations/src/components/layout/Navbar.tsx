'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-lg bg-white/85 shadow-lg py-2' 
          : 'bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="h-10 w-10 relative mr-2 overflow-hidden rounded-full bg-white p-1 shadow-md group-hover:shadow-lg transition-all duration-300">
              <Image 
                src="/nws_laser_logo.png" 
                alt="NWS Laser Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div>
              <span className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
                NWS Laser
              </span>
              <span className={`text-lg font-medium transition-colors duration-300 ml-1 ${isScrolled ? 'text-gray-700' : 'text-gray-100'}`}>
                Formations
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/courses"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/courses')
                  ? isScrolled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white/20 text-white' 
                  : isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
              }`}
            >
              Formations
            </Link>
            
            <Link
              href="/boutique"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/boutique')
                  ? isScrolled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white/20 text-white' 
                  : isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
              }`}
            >
              Boutique
            </Link>
            
            {session && session.user.role === 'admin' && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? isScrolled 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-white/20 text-white' 
                    : isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                }`}
              >
                Admin
              </Link>
            )}
            
            {session ? (
              <div className="flex items-center space-x-1">
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? isScrolled 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-white/20 text-white' 
                      : isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                  }`}
                >
                  Profil
                </Link>
                
                <NotificationsDropdown />
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Connexion
                </Link>
                
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700`}
                >
                  Inscription
                </Link>
              </div>
            )}
            
            <div className="relative">
              <button
                type="button"
                className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                id="legal-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Ouvrir le menu légal</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
              
              {/* Dropdown panel */}
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                <Link
                  href="/politique-confidentialite"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Confidentialité
                </Link>
                
                <Link
                  href="/cgv-cgu"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CGU / CGV
                </Link>
                
                <Link
                  href="/mentions-legales"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              </span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
          <Link
            href="/courses"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/courses')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Formations
          </Link>
          
          <Link
            href="/boutique"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/boutique')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Boutique
          </Link>
          
          {session && session.user.role === 'admin' && (
            <Link
              href="/admin"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Admin
            </Link>
          )}
          
          {session ? (
            <>
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/profile')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Profil
              </Link>
              
              <NotificationsDropdown />
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600"
                >
                  Connexion
                </Link>
                
                <Link
                  href="/register"
                  className="ml-4 block px-4 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-800">
                  Menu légal
                </div>
              </div>
            </div>
            
            <button
              type="button"
              className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id="legal-menu-button-mobile"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <span className="sr-only">Ouvrir le menu légal</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          
          <div
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
            id="legal-menu-mobile"
          >
            <Link
              href="/politique-confidentialite"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Confidentialité
            </Link>
            
            <Link
              href="/cgv-cgu"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              CGU / CGV
            </Link>
            
            <Link
              href="/mentions-legales"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
