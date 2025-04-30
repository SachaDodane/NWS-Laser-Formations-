import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

// Fonction pour générer un nom de fichier unique basé sur l'ID du cours
function generateFileName(courseId: string, originalUrl: string): string {
  // Récupérer l'extension du fichier à partir de l'URL
  const extension = originalUrl.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Générer un nom de fichier avec un timestamp pour éviter les collisions
  return `course-${courseId}-${Date.now()}.${extension}`;
}

// Fonction pour télécharger une image depuis une URL et la sauvegarder localement
async function downloadImage(imageUrl: string, destinationPath: string): Promise<void> {
  try {
    // Récupérer l'image depuis l'URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Échec du téléchargement de l'image: ${response.status} ${response.statusText}`);
    }
    
    // Créer un stream pour écrire le fichier
    const fileStream = fs.createWriteStream(destinationPath);
    
    // Convertir le body de la réponse en Readable stream
    const readableStream = Readable.fromWeb(response.body as any);
    
    // Écrire le contenu dans le fichier
    await finished(readableStream.pipe(fileStream));
    
    console.log(`Image téléchargée et sauvegardée: ${destinationPath}`);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé. Seuls les administrateurs peuvent effectuer cette action.' },
        { status: 401 }
      );
    }
    
    // Récupérer l'ID du cours et l'URL de l'image à partir du corps de la requête
    const { courseId, imageUrl } = await request.json();
    
    if (!courseId || !imageUrl) {
      return NextResponse.json(
        { message: 'L\'ID du cours et l\'URL de l\'image sont requis.' },
        { status: 400 }
      );
    }
    
    // Connexion à la base de données
    await connectDB();
    
    // Récupérer le cours
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json(
        { message: 'Cours non trouvé.' },
        { status: 404 }
      );
    }
    
    // Générer un nom de fichier pour l'image
    const fileName = generateFileName(courseId, imageUrl);
    
    // Définir le chemin de destination pour l'image
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images', 'courses');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const destinationPath = path.join(imagesDir, fileName);
    
    // Télécharger l'image et la sauvegarder localement
    await downloadImage(imageUrl, destinationPath);
    
    // Mettre à jour le chemin de l'image dans la base de données
    const relativeImagePath = `/images/courses/${fileName}`;
    course.image = relativeImagePath;
    await course.save();
    
    return NextResponse.json({
      message: 'Image téléchargée et associée au cours avec succès.',
      imagePath: relativeImagePath
    });
  } catch (error: any) {
    console.error('Erreur lors du téléchargement de l\'image du cours:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors du téléchargement de l\'image.' },
      { status: 500 }
    );
  }
}
