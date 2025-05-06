import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Service de protection CSRF
 */
export class CsrfProtection {
  private readonly CSRF_SECRET = process.env.CSRF_SECRET || 'nws-laser-formations-csrf-secret';
  private readonly TOKEN_COOKIE_NAME = 'csrf_token';
  private readonly HEADER_NAME = 'X-CSRF-Token';
  private readonly EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  /**
   * Génère un token CSRF et le stocke dans un cookie
   */
  generateToken(): string {
    // Créer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hacher le token avec le secret pour créer une signature
    const signature = this.createSignature(token);
    
    // Combiner le token et la signature
    const csrfToken = `${token}|${signature}`;
    
    // Encoder pour une utilisation dans un cookie
    const encodedToken = Buffer.from(csrfToken).toString('base64');
    
    // Définir l'expiration
    const expires = new Date(Date.now() + this.EXPIRY_TIME);
    
    // Stocker dans un cookie
    cookies().set({
      name: this.TOKEN_COOKIE_NAME,
      value: encodedToken,
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return token;
  }

  /**
   * Valide un token CSRF
   */
  validateToken(request: NextRequest): boolean {
    try {
      // Obtenir le token de l'en-tête
      const headerToken = request.headers.get(this.HEADER_NAME);
      
      // Obtenir le token stocké dans le cookie
      const cookieToken = request.cookies.get(this.TOKEN_COOKIE_NAME)?.value;
      
      if (!headerToken || !cookieToken) {
        return false;
      }
      
      // Décoder le token du cookie
      const decodedCookie = Buffer.from(cookieToken, 'base64').toString('utf-8');
      const [storedToken, storedSignature] = decodedCookie.split('|');
      
      // Vérifier que les tokens correspondent
      if (headerToken !== storedToken) {
        return false;
      }
      
      // Vérifier la signature
      const expectedSignature = this.createSignature(storedToken);
      return expectedSignature === storedSignature;
    } catch (error) {
      console.error('Erreur de validation CSRF:', error);
      return false;
    }
  }

  /**
   * Crée une signature HMAC pour un token
   */
  private createSignature(token: string): string {
    return crypto
      .createHmac('sha256', this.CSRF_SECRET)
      .update(token)
      .digest('hex');
  }

  /**
   * Middleware pour valider le token CSRF
   */
  middleware(request: NextRequest) {
    // Ne valider que les mutations (POST, PUT, DELETE, etc.)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    
    if (isMutation && !this.validateToken(request)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token CSRF invalide ou manquant' 
        }, 
        { status: 403 }
      );
    }
    
    return null;
  }
}

// Exporter une instance singleton
export const csrfProtection = new CsrfProtection();
