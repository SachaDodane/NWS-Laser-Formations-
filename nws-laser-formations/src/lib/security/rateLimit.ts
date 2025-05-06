import { NextRequest } from 'next/server';

// Interface pour le résultat de vérification de limite
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Stockage en mémoire pour les limites (dans un environnement de production, utilisez Redis)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

/**
 * Service de limitation de taux pour les API
 */
class RateLimitService {
  // Période de limite de taux en secondes (10 minutes)
  private readonly WINDOW_SIZE_IN_SECONDS = 600;
  
  // Nombre maximum de requêtes par période
  private readonly MAX_REQUESTS_PER_WINDOW = 100;
  
  /**
   * Vérifie si une requête dépasse la limite de taux
   */
  async check(request: NextRequest): Promise<RateLimitResult> {
    // Obtenir l'IP du client
    const ip = request.ip || 'unknown';
    
    // Obtenir l'URL de la requête
    const path = request.nextUrl.pathname;
    
    // Clé unique pour cette combinaison IP + chemin
    const key = `${ip}:${path}`;
    
    // Temps actuel
    const now = Math.floor(Date.now() / 1000);
    
    // Obtenir l'entrée existante ou en créer une nouvelle
    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + this.WINDOW_SIZE_IN_SECONDS };
    
    // Réinitialiser le compteur si la période est terminée
    if (current.resetTime <= now) {
      current.count = 0;
      current.resetTime = now + this.WINDOW_SIZE_IN_SECONDS;
    }
    
    // Incrémenter le compteur
    current.count += 1;
    
    // Mettre à jour le stockage
    rateLimitStore.set(key, current);
    
    // Vérifier si la limite est dépassée
    const isRateLimited = current.count > this.MAX_REQUESTS_PER_WINDOW;
    
    // Créer l'en-tête pour informer le client de l'état de sa limite
    const remaining = Math.max(0, this.MAX_REQUESTS_PER_WINDOW - current.count);
    
    return {
      success: !isRateLimited,
      limit: this.MAX_REQUESTS_PER_WINDOW,
      remaining,
      reset: current.resetTime,
    };
  }
  
  /**
   * Définit une limite personnalisée pour une route spécifique
   */
  setCustomLimit(path: string, limit: number, windowSize: number = this.WINDOW_SIZE_IN_SECONDS) {
    // Cette fonction pourrait être implémentée pour des limites personnalisées par route
    // Pour l'instant, elle est un placeholder pour une implémentation future
    console.log(`Limite personnalisée définie pour ${path}: ${limit} requêtes par ${windowSize} secondes`);
  }
}

// Exporter une instance singleton
export const rateLimit = new RateLimitService();
