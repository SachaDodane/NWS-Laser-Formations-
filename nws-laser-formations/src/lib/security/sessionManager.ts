import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { encryption } from './encryption';

/**
 * Gestionnaire de session côté serveur sécurisé
 * Permet de sécuriser et de gérer les cookies de session
 */
export class SessionManager {
  private readonly SESSION_COOKIE_NAME = 'nws_laser_session';
  private readonly SESSION_DURATION_DAYS = 7;
  
  /**
   * Crée un cookie de session sécurisé
   */
  createSecureSessionCookie(
    userId: string, 
    additionalData: Record<string, any> = {}
  ): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + this.SESSION_DURATION_DAYS);
    
    // Données de session à chiffrer
    const sessionData = {
      userId,
      ...additionalData,
      created: new Date().toISOString(),
      expires: expirationDate.toISOString(),
    };
    
    // Chiffrer les données de session
    const encryptedSession = encryption.encrypt(JSON.stringify(sessionData));
    
    // Configurer le cookie avec options de sécurité
    const cookieStore = cookies();
    cookieStore.set({
      name: this.SESSION_COOKIE_NAME,
      value: encryptedSession,
      expires: expirationDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  
  /**
   * Lit les données de session à partir du cookie
   */
  getSessionData(): Record<string, any> | null {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(this.SESSION_COOKIE_NAME);
      
      if (!sessionCookie) {
        return null;
      }
      
      // Déchiffrer les données de session
      const decryptedSession = encryption.decrypt(sessionCookie.value);
      
      if (!decryptedSession) {
        return null;
      }
      
      const sessionData = JSON.parse(decryptedSession);
      
      // Vérifier si la session est expirée
      if (new Date(sessionData.expires) < new Date()) {
        this.destroySession();
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error('Erreur lors de la lecture de la session:', error);
      this.destroySession();
      return null;
    }
  }
  
  /**
   * Détruit la session en supprimant le cookie
   */
  destroySession(): void {
    const cookieStore = cookies();
    cookieStore.delete(this.SESSION_COOKIE_NAME);
  }
  
  /**
   * Renouvelle la session existante
   */
  refreshSession(): void {
    const sessionData = this.getSessionData();
    
    if (sessionData) {
      this.createSecureSessionCookie(sessionData.userId, sessionData);
    }
  }
  
  /**
   * Vérifie si une session est valide
   */
  isSessionValid(): boolean {
    return this.getSessionData() !== null;
  }
  
  /**
   * Middleware pour vérifier si l'utilisateur est connecté
   */
  requireAuth(redirectUrl: string = '/auth/signin'): NextResponse | null {
    if (!this.isSessionValid()) {
      return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_BASE_URL));
    }
    
    return null;
  }
}

// Exporter une instance singleton
export const sessionManager = new SessionManager();
