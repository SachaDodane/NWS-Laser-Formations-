import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer les en-têtes de la réponse pour les modifier
  const responseHeaders = new Headers();
  
  // En-têtes de sécurité
  
  // Empêche le site d'être intégré dans des iframes (protection contre les attaques de clickjacking)
  responseHeaders.set('X-Frame-Options', 'DENY');
  
  // Indique au navigateur de ne pas MIME-sniff la réponse
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  
  // Protection XSS - force le navigateur à détecter et bloquer certaines attaques XSS
  responseHeaders.set('X-XSS-Protection', '1; mode=block');
  
  // CSP - Content Security Policy - Restreint les sources de contenu et les scripts
  responseHeaders.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.youtube.com; connect-src 'self' https://api.stripe.com; form-action 'self';"
  );
  
  // Indique aux navigateurs de ne pas cacher les données des utilisateurs
  responseHeaders.set('Cache-Control', 'no-store, max-age=0');
  
  // Mise en place de HSTS (HTTP Strict Transport Security)
  // Force l'utilisation de HTTPS
  if (process.env.NODE_ENV === 'production') {
    responseHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Empêche les navigateurs d'effectuer un MIME sniffing
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  
  // Permissions Policy (anciennement Feature-Policy)
  // Restreint les fonctionnalités du navigateur
  responseHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Retourne une réponse avec les en-têtes de sécurité
  return NextResponse.next({
    headers: responseHeaders,
  });
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    // Exclure les ressources statiques et les API health-check
    '/((?!_next/static|_next/image|favicon.ico|health).*)',
  ],
};
