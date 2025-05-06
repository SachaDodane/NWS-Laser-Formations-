/**
 * Service définissant et appliquant la politique de sécurité des mots de passe
 */
export class PasswordPolicyService {
  // Paramètres de politique
  private readonly MIN_LENGTH = 10;
  private readonly REQUIRE_UPPERCASE = true;
  private readonly REQUIRE_LOWERCASE = true;
  private readonly REQUIRE_NUMBER = true;
  private readonly REQUIRE_SPECIAL = true;
  private readonly MAX_AGE_DAYS = 90;
  private readonly HISTORY_SIZE = 5;
  
  /**
   * Vérifie si un mot de passe respecte la politique de sécurité
   */
  validatePassword(password: string): { valid: boolean; message: string } {
    // Vérifier la longueur minimale
    if (password.length < this.MIN_LENGTH) {
      return {
        valid: false,
        message: `Le mot de passe doit contenir au moins ${this.MIN_LENGTH} caractères.`
      };
    }
    
    // Vérifier les majuscules
    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins une lettre majuscule.'
      };
    }
    
    // Vérifier les minuscules
    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins une lettre minuscule.'
      };
    }
    
    // Vérifier les chiffres
    if (this.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins un chiffre.'
      };
    }
    
    // Vérifier les caractères spéciaux
    if (this.REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins un caractère spécial.'
      };
    }
    
    // Vérifier les séquences communes
    if (/123|abc|password|azerty|qwerty/i.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe ne doit pas contenir de séquences communes.'
      };
    }
    
    // Si toutes les vérifications sont passées
    return {
      valid: true,
      message: 'Mot de passe valide.'
    };
  }
  
  /**
   * Vérifie si un mot de passe doit être renouvelé
   */
  isPasswordExpired(lastChangedDate: Date): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChangedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > this.MAX_AGE_DAYS;
  }
  
  /**
   * Calcule la force du mot de passe (0-100)
   */
  calculatePasswordStrength(password: string): number {
    let strength = 0;
    
    // Points pour la longueur
    strength += Math.min(password.length * 4, 40);
    
    // Points pour la variété de caractères
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Pénalités pour les répétitions
    const repetitions = password.match(/(.)\1+/g);
    if (repetitions) {
      strength -= repetitions.length * 2;
    }
    
    // Pénalités pour les séquences
    if (/123|abc|password|azerty|qwerty/i.test(password)) {
      strength -= 20;
    }
    
    // Borner le résultat entre 0 et 100
    return Math.max(0, Math.min(100, strength));
  }
  
  /**
   * Génère un rappel pour le changement de mot de passe
   */
  getPasswordChangeReminder(lastChangedDate: Date): string | null {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChangedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = this.MAX_AGE_DAYS - diffDays;
    
    if (daysLeft <= 0) {
      return 'Votre mot de passe a expiré. Veuillez le changer dès maintenant.';
    } else if (daysLeft <= 7) {
      return `Votre mot de passe expirera dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Veuillez le changer bientôt.`;
    }
    
    return null;
  }
}

// Exporter une instance singleton
export const passwordPolicy = new PasswordPolicyService();
