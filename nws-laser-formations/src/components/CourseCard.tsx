'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  completionPercentage: number;
  isCompleted: boolean;
  chapterProgress: any[];
}

interface CourseCardProps {
  course: Course;
  progress?: Progress;
  showProgress?: boolean;
}

// Images de secours locales au cas où le cours n'a pas d'image
const localCourseImages = [
  "/images/courses/course-1.jpg",
  "/images/courses/course-2.jpg",
  "/images/courses/course-3.jpg",
  "/images/courses/course-4.jpg",
  "/images/courses/course-5.jpg",
];

export default function CourseCard({ course, progress, showProgress = false }: CourseCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Déterminer si l'utilisateur est déjà inscrit à ce cours
  const isEnrolled = progress !== undefined;
  
  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = session?.user?.role === 'admin';

  // Si admin et pas encore inscrit, rediriger vers l'API d'attribution de tous les cours
  const handleAdminAccess = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/assign-all-courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'attribution des cours');
      }

      toast.success('Tous les cours ont été attribués à votre compte');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de l\'attribution des cours');
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = progress?.completionPercentage || 0;
  
  // Obtenir une image de secours basée sur l'ID du cours (stable pour le même cours)
  const getFallbackImage = () => {
    // Utiliser l'ID du cours pour générer un index stable
    const charSum = course._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % localCourseImages.length;
    return localCourseImages[index];
  };
  
  // Déterminer l'image à utiliser
  let imageToUse = course.image && course.image.trim() !== '' ? course.image : (course.imageUrl && course.imageUrl.trim() !== '' ? course.imageUrl : getFallbackImage());
  
  const handlePurchase = async () => {
    if (!session) {
      toast.error('Veuillez vous connecter pour acheter ce cours');
      router.push('/login');
      return;
    }
    
    try {
      setLoading(true);
      
      // Navigation directe vers la page d'achat sans passer par l'API de paiement
      router.push(`/courses/${course._id}/purchase`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors du traitement de votre demande');
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="relative h-48 w-full">
        <Image
          src={imageToUse}
          alt={course.title}
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Overlay "Voir les détails" au survol */}
        <Link href={`/courses/${course._id}`} className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
          <div className="p-4 text-white w-full">
            <p className="font-bold">Voir les détails</p>
          </div>
        </Link>
      </div>
      <div className="p-4">
        <p className="text-gray-600 line-clamp-2 h-10 mb-3">{course.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-blue-600">{course.price}€</span>
          
          {isAdmin && !isEnrolled ? (
            <button
              onClick={handleAdminAccess}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70"
            >
              {loading ? 'Chargement...' : 'Attribuer automatiquement'}
            </button>
          ) : isEnrolled ? (
            <Link 
              href={`/my-courses/${course._id}`} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {showProgress 
                ? `Continuer (${completionPercentage}%)` 
                : 'Continuer'
              }
            </Link>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70"
            >
              {loading ? 'Chargement...' : 'Acheter'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
