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
  
  const isEnrolled = progress !== undefined;
  const completionPercentage = progress?.completionPercentage || 0;
  
  // Obtenir une image de secours basée sur l'ID du cours (stable pour le même cours)
  const getFallbackImage = () => {
    // Utiliser l'ID du cours pour générer un index stable
    const charSum = course._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % localCourseImages.length;
    return localCourseImages[index];
  };
  
  // Déterminer l'image à utiliser
  let imageToUse = course.image;
  
  // Si l'image n'existe pas ou a généré une erreur, utiliser une image de secours locale
  if (!imageToUse || imageError) {
    imageToUse = getFallbackImage();
  }
  
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
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg">{course.title}</p>
          {isEnrolled && (
            <div className="bg-white/20 rounded-full h-1.5 mt-2">
              <div 
                className="bg-green-400 h-1.5 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 line-clamp-2 h-10 mb-3">{course.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-blue-600">{course.price}€</span>
          
          {isEnrolled ? (
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
