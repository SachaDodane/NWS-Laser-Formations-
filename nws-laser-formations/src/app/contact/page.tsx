import { Metadata } from 'next';
import { FadeIn } from '@/components/animations/MotionEffects';
import ContactForm from '@/components/ContactForm';
import GoogleMap from '@/components/maps/GoogleMap';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | NWS Laser Formations',
  description: 'Contactez-nous pour toutes vos questions sur nos formations laser professionnelles.',
};

// Coordonnées de Villers-les-Pots
const LOCATION = {
  address: '905a route départementale de Villers-les-Pots, 21130',
  latitude: 47.7219,
  longitude: 5.3159
};

// Remplacez cette valeur par votre clé d'API Google Maps réelle
// Pour la sécurité, envisagez de déplacer cela dans un fichier .env
const GOOGLE_MAPS_API_KEY = 'VOTRE_CLE_API_GOOGLE_MAPS';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <FadeIn direction="up">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous sommes à votre disposition pour répondre à toutes vos questions concernant nos formations laser professionnelles.
            </p>
          </FadeIn>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire de contact */}
          <FadeIn direction="right" delay={0.1}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                <ContactForm />
              </div>
            </div>
          </FadeIn>
          
          {/* Informations de contact */}
          <FadeIn direction="left" delay={0.2}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/courses/default.jpg"
                  alt="Image de contact"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-900/80 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <h2 className="text-2xl font-bold mb-4">NWS Laser Formations</h2>
                    <p className="text-lg">L'excellence dans la formation laser professionnelle</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                      <p>{LOCATION.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p>contact@nws-laser-formations.fr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <h3 className="text-lg font-medium text-gray-900">Téléphone</h3>
                      <p>+33 (0)2 XX XX XX XX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <h3 className="text-lg font-medium text-gray-900">Horaires</h3>
                      <p>Lundi - Vendredi: 9:00 - 18:00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">Instagram</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">YouTube</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        
        {/* Google Maps */}
        <FadeIn direction="up" delay={0.3}>
          <div className="mt-12">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nous trouver</h2>
              
              {/* Utiliser le composant client GoogleMap */}
              <GoogleMap 
                apiKey={GOOGLE_MAPS_API_KEY}
                address={LOCATION.address}
                latitude={LOCATION.latitude}
                longitude={LOCATION.longitude}
                zoom={15}
                height="500px"
              />
            </div>
          </div>
        </FadeIn>
        
        {/* FAQ */}
        <FadeIn direction="up" delay={0.4}>
          <div className="mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900">Comment puis-je m'inscrire à une formation ?</h3>
                  <p className="mt-2 text-gray-600">
                    Pour vous inscrire à une formation, il suffit de créer un compte sur notre plateforme, 
                    de parcourir notre catalogue de formations et de sélectionner celle qui vous intéresse. 
                    Suivez ensuite les étapes de paiement pour finaliser votre inscription.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900">Les formations sont-elles éligibles au CPF ?</h3>
                  <p className="mt-2 text-gray-600">
                    Certaines de nos formations sont éligibles au Compte Personnel de Formation (CPF). 
                    Consultez les détails de chaque formation pour vérifier son éligibilité et les modalités 
                    spécifiques de financement.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900">Quelle est la durée de validité de mes accès aux formations ?</h3>
                  <p className="mt-2 text-gray-600">
                    Une fois inscrit à une formation, vous bénéficiez d'un accès illimité dans le temps. 
                    Vous pourrez ainsi apprendre à votre rythme et revenir consulter le contenu à tout moment, 
                    même après avoir complété la formation.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900">Comment obtenir mon certificat de formation ?</h3>
                  <p className="mt-2 text-gray-600">
                    Pour obtenir votre certificat, vous devez compléter 100% de la formation, y compris tous 
                    les chapitres et réussir les quiz requis. Une fois ces conditions remplies, vous pourrez 
                    télécharger votre certificat directement depuis votre espace personnel.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Proposez-vous des formations sur mesure pour les entreprises ?</h3>
                  <p className="mt-2 text-gray-600">
                    Oui, nous proposons des formations personnalisées pour les entreprises. Contactez notre 
                    équipe commerciale via le formulaire de contact pour discuter de vos besoins spécifiques 
                    et obtenir une offre adaptée à votre organisation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
