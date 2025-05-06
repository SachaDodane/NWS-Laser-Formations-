import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { rateLimit } from './rateLimit';

// Types d'utilisateurs
export type UserRole = 'admin' | 'user' | 'instructor';

/**
 * Middleware de validation d'API qui vérifie l'authentification, les autorisations et applique les limites de taux
 */
export async function validateApiRequest(
  request: NextRequest,
  requiredRoles?: UserRole[],
  options?: {
    skipRateLimit?: boolean;
  }
) {
  try {
    // Vérifier si la requête dépasse la limite de taux 
    if (!options?.skipRateLimit) {
      const rateLimitResult = await rateLimit.check(request);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Trop de requêtes, veuillez réessayer plus tard' 
          }, 
          { status: 429 }
        );
      }
    }

    // Vérifier l'authentification si nécessaire
    if (requiredRoles) {
      const session = await getServerSession(authOptions);
      
      // Vérifier si l'utilisateur est connecté
      if (!session || !session.user) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Non autorisé - Authentification requise' 
          }, 
          { status: 401 }
        );
      }
      
      // Vérifier les rôles si spécifiés
      if (requiredRoles.length > 0) {
        const userRole = session.user.role as UserRole;
        if (!userRole || !requiredRoles.includes(userRole)) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Non autorisé - Rôle insuffisant' 
            }, 
            { status: 403 }
          );
        }
      }
    }
    
    // Si toutes les vérifications sont passées
    return null;
  } catch (error) {
    console.error('Erreur de validation API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Valide le format des identifiants MongoDB
 */
export function validateMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Désinfecte les entrées utilisateur pour éviter les injections
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide les entrées utilisateur
 */
export function validateUserInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

/**
 * Modèles de validation courants
 */
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z0-9\s\-']{2,50}$/,
  phoneNumber: /^\+?[0-9]{10,15}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};
