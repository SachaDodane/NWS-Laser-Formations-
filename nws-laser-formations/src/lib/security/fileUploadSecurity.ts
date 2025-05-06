import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Configuration des types de fichiers autorisés et leurs limites
 */
const FILE_CONFIGS = {
  // Images
  'image/jpeg': { maxSize: 5 * 1024 * 1024, ext: '.jpg' },  // 5 MB
  'image/png': { maxSize: 5 * 1024 * 1024, ext: '.png' },   // 5 MB
  'image/webp': { maxSize: 5 * 1024 * 1024, ext: '.webp' }, // 5 MB
  'image/svg+xml': { maxSize: 1 * 1024 * 1024, ext: '.svg' }, // 1 MB
  
  // Documents
  'application/pdf': { maxSize: 10 * 1024 * 1024, ext: '.pdf' }, // 10 MB
  
  // Vidéos (si applicable)
  'video/mp4': { maxSize: 100 * 1024 * 1024, ext: '.mp4' }, // 100 MB
  
  // Audio (si applicable)
  'audio/mpeg': { maxSize: 20 * 1024 * 1024, ext: '.mp3' }, // 20 MB
};

/**
 * Service pour sécuriser les téléchargements de fichiers
 */
export class FileUploadSecurity {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
  
  constructor() {
    // Créer le répertoire de téléchargements s'il n'existe pas
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      try {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
      } catch (error) {
        console.error('Erreur lors de la création du répertoire de téléchargements:', error);
      }
    }
  }
  
  /**
   * Valide un fichier téléchargé
   */
  validateFile(
    file: File,
    options?: {
      allowedTypes?: string[];
      maxSize?: number;
      customValidation?: (file: File) => boolean;
    }
  ): { valid: boolean; message: string } {
    // Vérifier si le type de fichier est autorisé
    const allowedTypes = options?.allowedTypes || Object.keys(FILE_CONFIGS);
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`
      };
    }
    
    // Vérifier la taille du fichier
    const config = FILE_CONFIGS[file.type as keyof typeof FILE_CONFIGS];
    const maxSize = options?.maxSize || (config ? config.maxSize : 5 * 1024 * 1024);
    
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `Fichier trop volumineux. Taille maximale: ${Math.round(maxSize / (1024 * 1024))} MB`
      };
    }
    
    // Validation personnalisée si fournie
    if (options?.customValidation && !options.customValidation(file)) {
      return {
        valid: false,
        message: `Le fichier n'a pas passé la validation personnalisée`
      };
    }
    
    return {
      valid: true,
      message: 'Fichier valide'
    };
  }
  
  /**
   * Sauvegarde un fichier téléchargé de manière sécurisée
   */
  async saveFile(
    file: File, 
    subdir: string = '',
    sanitizeFilename: boolean = true
  ): Promise<{ path: string; filename: string }> {
    try {
      // Valider le fichier
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Créer le sous-répertoire si nécessaire
      const uploadPath = subdir 
        ? path.join(this.UPLOAD_DIR, subdir) 
        : this.UPLOAD_DIR;
        
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      // Générer un nom de fichier sécurisé
      const config = FILE_CONFIGS[file.type as keyof typeof FILE_CONFIGS];
      const ext = config ? config.ext : path.extname(file.name);
      
      let filename;
      if (sanitizeFilename) {
        // Générer un nom unique basé sur un hash
        const hash = crypto.createHash('sha256')
          .update(`${file.name}-${Date.now()}-${Math.random()}`)
          .digest('hex')
          .substring(0, 16);
          
        filename = `${hash}${ext}`;
      } else {
        // Utiliser le nom d'origine mais le nettoyer
        const cleanName = file.name
          .replace(/[^a-zA-Z0-9_.-]/g, '_')
          .replace(/_{2,}/g, '_');
          
        filename = cleanName;
      }
      
      const filePath = path.join(uploadPath, filename);
      
      // Convertir le fichier en tableau d'octets
      const buffer = await file.arrayBuffer();
      
      // Écrire le fichier
      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      // Vérifier l'intégrité du fichier
      const stats = fs.statSync(filePath);
      if (stats.size !== file.size) {
        // Supprimer le fichier en cas d'incohérence
        fs.unlinkSync(filePath);
        throw new Error('Erreur d\'intégrité du fichier');
      }
      
      return {
        path: subdir ? `/uploads/${subdir}/${filename}` : `/uploads/${filename}`,
        filename,
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier:', error);
      throw error;
    }
  }
  
  /**
   * Analyse le contenu d'un fichier image pour détecter d'éventuelles menaces
   */
  async scanImageContent(file: File): Promise<boolean> {
    try {
      // Vérifier si c'est bien une image
      if (!file.type.startsWith('image/')) {
        return false;
      }
      
      // Note: Dans un environnement de production, on pourrait intégrer
      // un service d'analyse d'images comme ClamAV, Virustotal, etc.
      // Ici nous faisons une vérification de base des signatures
      
      const buffer = await file.arrayBuffer();
      const fileContent = Buffer.from(buffer);
      
      // Vérifier les en-têtes de fichiers communs
      // JPEG commence par FF D8
      if (file.type === 'image/jpeg' && 
          !(fileContent[0] === 0xFF && fileContent[1] === 0xD8)) {
        return false;
      }
      
      // PNG commence par 89 50 4E 47
      if (file.type === 'image/png' && 
          !(fileContent[0] === 0x89 && fileContent[1] === 0x50 && 
            fileContent[2] === 0x4E && fileContent[3] === 0x47)) {
        return false;
      }
      
      // Vérifier la présence de scripts dans SVG
      if (file.type === 'image/svg+xml') {
        const content = fileContent.toString('utf8');
        if (content.includes('<script') || 
            content.includes('javascript:') || 
            content.includes('eval(')) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de l\'image:', error);
      return false;
    }
  }
  
  /**
   * Génère un nom de fichier aléatoire et sécurisé
   */
  generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    
    return `${timestamp}-${randomString}${ext}`;
  }
}

// Exporter une instance singleton
export const fileUploadSecurity = new FileUploadSecurity();
