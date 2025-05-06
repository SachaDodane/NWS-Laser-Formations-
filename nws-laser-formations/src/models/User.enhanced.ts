import mongoose, { Schema, Document } from 'mongoose';
import { PasswordService } from '@/lib/security/encryption';

// Interface utilisateur
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: 'admin' | 'user' | 'instructor';
  provider?: string;
  providerId?: string;
  emailVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  accountCreated: Date;
  accountUpdated: Date;
  lastPasswordChange: Date;
  oldPasswords: string[];
}

// Schéma utilisateur
const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Le nom est obligatoire'], 
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'] 
  },
  email: { 
    type: String, 
    required: [true, 'L\'email est obligatoire'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Veuillez fournir un email valide'] 
  },
  password: { 
    type: String, 
    select: false, // Ne pas inclure par défaut dans les requêtes
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'] 
  },
  image: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ['admin', 'user', 'instructor'], 
    default: 'user' 
  },
  provider: { 
    type: String, 
    enum: ['credentials', 'google', 'github', null], 
    default: 'credentials' 
  },
  providerId: { 
    type: String 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: { 
    type: String, 
    select: false 
  },
  passwordResetToken: { 
    type: String, 
    select: false 
  },
  passwordResetExpires: { 
    type: Date, 
    select: false 
  },
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Date 
  },
  lastLogin: { 
    type: Date 
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String, 
    select: false 
  },
  accountCreated: { 
    type: Date, 
    default: Date.now 
  },
  accountUpdated: { 
    type: Date, 
    default: Date.now 
  },
  lastPasswordChange: { 
    type: Date, 
    default: Date.now 
  },
  oldPasswords: { 
    type: [String], 
    select: false, 
    default: [] 
  }
}, {
  timestamps: true,
});

// Hooks pré-sauvegarde
userSchema.pre('save', async function(next) {
  // Mettre à jour la date de modification
  this.accountUpdated = new Date();
  
  // Ne hacher le mot de passe que s'il a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    // Stocker l'ancien mot de passe s'il existe
    if (this.password) {
      this.oldPasswords.push(this.password);
      // Garder seulement les 5 derniers mots de passe
      if (this.oldPasswords.length > 5) {
        this.oldPasswords.shift();
      }
    }
    
    // Hacher le nouveau mot de passe
    this.password = await PasswordService.hashPassword(this.password);
    this.lastPasswordChange = new Date();
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour vérifier si le mot de passe a déjà été utilisé
userSchema.methods.isPasswordPreviouslyUsed = async function(password: string): Promise<boolean> {
  // Vérifier les anciens mots de passe
  for (const oldPassword of this.oldPasswords) {
    const match = await PasswordService.verifyPassword(password, oldPassword);
    if (match) return true;
  }
  return false;
};

// Méthode pour vérifier si le compte est verrouillé
userSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Modèle utilisateur
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
