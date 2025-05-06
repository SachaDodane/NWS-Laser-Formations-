import crypto from 'crypto';

/**
 * Utility for encrypting and decrypting sensitive data
 */
export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  
  constructor() {
    // Utiliser une clé d'environnement ou générer une par défaut
    const secret = process.env.ENCRYPTION_KEY || 'nws-laser-formations-secure-encryption-key';
    
    // Créer une clé de 32 octets (256 bits) à partir de la chaîne secrète
    this.key = crypto.createHash('sha256').update(String(secret)).digest();
  }
  
  /**
   * Chiffre une chaîne de caractères
   */
  encrypt(text: string): string {
    // Génère un vecteur d'initialisation aléatoire
    const iv = crypto.randomBytes(16);
    
    // Crée un chiffreur avec la clé et l'IV
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    // Chiffre le texte
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retourne l'IV et le texte chiffré
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Déchiffre une chaîne de caractères
   */
  decrypt(encryptedText: string): string {
    try {
      // Extrait l'IV et le texte chiffré
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift() || '', 'hex');
      const encryptedData = textParts.join(':');
      
      // Crée un déchiffreur avec la clé et l'IV
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      // Déchiffre le texte
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return '';
    }
  }
}

// Exporter une instance singleton
export const encryption = new EncryptionService();

/**
 * Fonctions pour la gestion sécurisée des mots de passe
 */
export class PasswordService {
  /**
   * Génère un hash sécurisé du mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Génère un sel aléatoire
      crypto.randomBytes(16, (err, salt) => {
        if (err) return reject(err);
        
        // Dérive une clé à partir du mot de passe avec PBKDF2
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
          if (err) return reject(err);
          
          // Stocke le sel et la clé dérivée
          const hash = `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
          resolve(hash);
        });
      });
    });
  }
  
  /**
   * Vérifie si un mot de passe correspond à un hash
   */
  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Extrait le sel et le hash stocké
      const [salt, hash] = storedHash.split(':');
      
      // Si les parties sont manquantes, rejette
      if (!salt || !hash) return resolve(false);
      
      // Dérive une clé à partir du mot de passe avec le même sel
      crypto.pbkdf2(password, Buffer.from(salt, 'hex'), 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) return reject(err);
        
        // Compare le hash dérivé avec le hash stocké
        resolve(derivedKey.toString('hex') === hash);
      });
    });
  }
  
  /**
   * Génère un mot de passe fort aléatoire
   */
  static generateStrongPassword(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Fonction utilitaire pour obtenir un caractère aléatoire
    const getRandomChar = () => charset.charAt(Math.floor(Math.random() * charset.length));
    
    // Assure que le mot de passe a au moins un de chaque type
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26)); // minuscule
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26)); // majuscule
    password += '0123456789'.charAt(Math.floor(Math.random() * 10));                 // chiffre
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'.charAt(Math.floor(Math.random() * 29)); // symbole
    
    // Remplit le reste du mot de passe
    for (let i = 4; i < length; i++) {
      password += getRandomChar();
    }
    
    // Mélange les caractères pour éviter un motif prévisible
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
