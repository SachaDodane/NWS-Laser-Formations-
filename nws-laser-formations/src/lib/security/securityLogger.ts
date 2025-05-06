import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

/**
 * Types d'événements de sécurité à journaliser
 */
export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTHENTICATION_SUCCESS',
  AUTH_FAILURE = 'AUTHENTICATION_FAILURE',
  AUTH_LOCKOUT = 'ACCOUNT_LOCKOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET_REQUESTED',
  ADMIN_ACTION = 'ADMIN_ACTION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  INJECTION_ATTEMPT = 'INJECTION_ATTEMPT'
}

/**
 * Interface pour les données d'un événement de sécurité
 */
interface SecurityEvent {
  timestamp: string;
  type: SecurityEventType;
  userId?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  details?: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Service de journalisation sécurisée
 */
export class SecurityLogger {
  private readonly LOG_DIR = path.join(process.cwd(), 'logs');
  private readonly SECURITY_LOG_FILE = 'security.log';
  private readonly SUSPICIOUS_LOG_FILE = 'suspicious.log';
  
  constructor() {
    // Créer le répertoire de logs s'il n'existe pas
    if (!fs.existsSync(this.LOG_DIR)) {
      try {
        fs.mkdirSync(this.LOG_DIR, { recursive: true });
      } catch (error) {
        console.error('Erreur lors de la création du répertoire de logs:', error);
      }
    }
  }

  /**
   * Journalise un événement de sécurité
   */
  logSecurityEvent(
    eventType: SecurityEventType,
    request?: NextRequest,
    options?: {
      userId?: string;
      username?: string;
      details?: any;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }
  ): void {
    try {
      const timestamp = new Date().toISOString();
      
      // Obtenir l'adresse IP depuis l'en-tête x-forwarded-for en premier, puis remote-addr
      let ip = 'unknown';
      if (request) {
        const forwardedFor = request.headers.get('x-forwarded-for');
        if (forwardedFor) {
          // Prendre la première IP (la plus proche du client)
          ip = forwardedFor.split(',')[0].trim();
        } else {
          // Fallback: utiliser l'adresse distante si disponible
          const remoteAddr = request.headers.get('x-real-ip');
          if (remoteAddr) {
            ip = remoteAddr;
          }
        }
      }
      
      const userAgent = request?.headers.get('user-agent') || 'unknown';
      const path = request?.nextUrl?.pathname || 'unknown';
      
      const event: SecurityEvent = {
        timestamp,
        type: eventType,
        userId: options?.userId,
        username: options?.username,
        ip,
        userAgent,
        path,
        details: options?.details,
        severity: options?.severity || 'MEDIUM',
      };
      
      // Journaliser dans le fichier approprié
      this.writeToLog(event);
      
      // Journaliser séparément les événements suspects
      if (
        event.severity === 'HIGH' || 
        event.severity === 'CRITICAL' || 
        eventType === SecurityEventType.SUSPICIOUS_ACTIVITY ||
        eventType === SecurityEventType.INJECTION_ATTEMPT ||
        eventType === SecurityEventType.XSS_ATTEMPT ||
        (eventType === SecurityEventType.AUTH_FAILURE && options?.details?.attempts > 3)
      ) {
        this.writeToSuspiciousLog(event);
      }
      
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'événement de sécurité:', error);
    }
  }

  /**
   * Écrit dans le fichier de log principal
   */
  private writeToLog(event: SecurityEvent): void {
    try {
      const logPath = path.join(this.LOG_DIR, this.SECURITY_LOG_FILE);
      const logEntry = JSON.stringify(event) + '\n';
      
      fs.appendFileSync(logPath, logEntry, { encoding: 'utf8' });
    } catch (error) {
      console.error('Erreur lors de l\'écriture dans le fichier de log:', error);
    }
  }

  /**
   * Écrit dans le fichier de log des activités suspectes
   */
  private writeToSuspiciousLog(event: SecurityEvent): void {
    try {
      const logPath = path.join(this.LOG_DIR, this.SUSPICIOUS_LOG_FILE);
      const logEntry = JSON.stringify(event) + '\n';
      
      fs.appendFileSync(logPath, logEntry, { encoding: 'utf8' });
    } catch (error) {
      console.error('Erreur lors de l\'écriture dans le fichier de log des activités suspectes:', error);
    }
  }
}

// Exporter une instance singleton
export const securityLogger = new SecurityLogger();
