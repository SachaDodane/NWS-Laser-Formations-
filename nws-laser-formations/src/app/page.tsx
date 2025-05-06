import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import Course from "@/models/Course";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import StatsSection from "@/components/home/StatsSection";
import FaqSection from "@/components/home/FaqSection";
import PartnersSection from "@/components/home/PartnersSection";
import ScrollAnimations from "@/components/ScrollAnimations";
import TypewriterText from "@/components/TypewriterText";

// Interface pour typer correctement les données de cours
interface CourseData {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// Fonction pour récupérer les cours dynamiquement
async function getTopCourses(): Promise<CourseData[]> {
  try {
    await connectDB();
    // Récupérer les 3 premiers cours (ou un nombre défini)
    const courses = await Course.find().limit(3).lean();
    
    // Convertir les IDs et dates en chaînes pour éviter les erreurs d'hydratation
    return courses.map(course => ({
      ...course,
      _id: course._id ? course._id.toString() : '',
      title: course.title || "Formation sans titre",
      description: course.description || "Aucune description disponible",
      price: course.price || 0,
      image: course.image,
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return [];
  }
}

export default async function Home() {
  // Récupérer les 3 premiers cours pour la page d'accueil
  const topCourses = await getTopCourses();

  // Tableau d'images pour les cours (fallback si pas d'image dans la DB)
  const courseImages = [
    "/images/courses/default.jpg",
    "/images/courses/default.jpg",
    "/images/courses/default.jpg"
  ];
  
  return (
    <div className="bg-white">
      {/* Composant pour activer les animations au scroll */}
      <ScrollAnimations />
      
      {/* Hero Section animée */}
      <section className="relative bg-blue-700 text-white overflow-hidden">
        {/* Background pattern avec animation */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-800 parallax-scroll parallax-slow"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="absolute w-full h-full text-white opacity-5" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
              <path d="M-30,150 C-10,50 70,-30 150,50" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray="1 28" strokeLinecap="round" className="spin" style={{transformOrigin: "center"}}/>
            </svg>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fadeIn">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Formations laser <span className="colorChange">professionnelles</span>
              </h1>
              <div className="text-xl mb-8">
                <TypewriterText 
                  lines={[
                    "Développez vos compétences dans le domaine du laser.",
                    "Formations certifiantes disponibles 24/7.",
                    "Accompagnement par des experts."
                  ]}
                  speed={80}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/register" 
                  className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg transition-colors glow-effect"
                >
                  Commencer maintenant
                </Link>
                <Link 
                  href="#formations" 
                  className="bg-blue-800 hover:bg-blue-900 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  Voir les formations
                </Link>
              </div>
            </div>
            <div className="flex justify-center slideInUp">
              <div className="relative w-72 h-72 md:w-96 md:h-96 shine-effect floating">
                <Image
                  src="/images/courses/laser_education_icon.png"
                  alt="NWS Laser Formations"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section avec animations */}
      <section className="py-16 md:py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir nos formations ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NWS Laser Formations propose des contenus de qualité créés par des experts du domaine.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow shine-effect transform transition-transform">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-6 pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">100% en ligne</h3>
              <p className="text-gray-600">
                Accédez à vos formations n'importe où, n'importe quand, sur tous vos appareils.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow shine-effect transform transition-transform">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-6 pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Certification officielle</h3>
              <p className="text-gray-600">
                Obtenez un certificat reconnu par l'industrie après la réussite de votre formation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow shine-effect transform transition-transform">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-6 pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Contenu interactif</h3>
              <p className="text-gray-600">
                Des quiz, vidéos et exercices pratiques pour une meilleure rétention des connaissances.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistiques */}
      <StatsSection />
      
      {/* Courses Section */}
      <section id="formations" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-section">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nos formations laser</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre catalogue de formations spécialisées dans le domaine du laser.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topCourses.length > 0 ? (
              topCourses.map((course, index) => (
                <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in-section is-visible">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={course.image || courseImages[index % courseImages.length]} 
                      alt={course.title} 
                      fill 
                      className="object-cover scale-animate" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <Link href={`/courses/${course._id}`} className="p-4 text-white w-full">
                        <p className="font-bold">Voir les détails</p>
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {course.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">{course.price} €</span>
                      <Link 
                        href={`/courses/${course._id}`} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors glow-effect"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Formations de secours si aucune n'est trouvée en base de données
              <>
                {/* Course 1 */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in-section is-visible">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={courseImages[0]} 
                      alt="Traitement Laser Textile" 
                      fill 
                      className="object-cover scale-animate" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-bold">Voir les détails</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Sécurité Laser Niveau 1</h3>
                    <p className="text-gray-600 mb-4">
                      Apprenez les fondamentaux de la sécurité laser dans les environnements professionnels.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">199 €</span>
                      <Link 
                        href="/courses/securite-laser-1" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors glow-effect"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Course 2 */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in-section is-visible">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={courseImages[1]} 
                      alt="Découpe Laser Métal" 
                      fill 
                      className="object-cover scale-animate" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-bold">Voir les détails</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Technologie Laser</h3>
                    <p className="text-gray-600 mb-4">
                      Maîtrisez les principes fondamentaux de la technologie laser et ses applications.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">249 €</span>
                      <Link 
                        href="/courses/technologie-laser" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors glow-effect"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Course 3 */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in-section is-visible">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={courseImages[2]} 
                      alt="Laser de découpe" 
                      fill 
                      className="object-cover scale-animate" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-bold">Voir les détails</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Laser Médical</h3>
                    <p className="text-gray-600 mb-4">
                      Explorez les applications médicales des technologies laser dans le domaine de la santé.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">299 €</span>
                      <Link 
                        href="/courses/laser-medical" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors glow-effect"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/courses" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg inline-block transition-colors btn-pulse"
            >
              Voir toutes les formations
            </Link>
          </div>
        </div>
      </section>
      
      {/* Témoignages */}
      <TestimonialsSection />
      
      {/* FAQ */}
      <FaqSection />
      
      {/* Partenaires */}
      <PartnersSection />
      
      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Élément décoratif animé */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <svg className="absolute -right-10 -bottom-10 w-80 h-80 text-white opacity-30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.3,-78.1C60.9,-71.5,77.1,-62,86.2,-47.4C95.4,-32.8,97.5,-13.1,95.2,5.9C92.9,24.9,86.3,43.2,75,58.9C63.8,74.7,48,88,30.9,93.1C13.8,98.3,-4.4,95.3,-25.3,91.6C-46.2,87.8,-69.7,83.3,-85.1,69.5C-100.5,55.7,-107.7,32.7,-108.7,10.3C-109.6,-12.2,-104.3,-34.1,-92.4,-51.4C-80.6,-68.8,-62.2,-81.7,-44.3,-87.2C-26.4,-92.7,-9,-91,5.5,-86.8C20,-82.6,29.7,-84.8,45.3,-78.1Z" transform="translate(100 100)" className="spin" style={{transformOrigin: "center"}}/>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à développer vos compétences ?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Rejoignez notre communauté d'apprenants et commencez votre parcours d'apprentissage dès aujourd'hui.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/register" 
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg transition-colors glow-effect"
              >
                S'inscrire
              </Link>
              <Link 
                href="/courses" 
                className="bg-blue-800 hover:bg-blue-900 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Explorer les formations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Script pour activer les animations basées sur le scroll */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                }
              });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.fade-in-section').forEach(section => {
              observer.observe(section);
            });
          });
        `
      }} />
    </div>
  );
}
