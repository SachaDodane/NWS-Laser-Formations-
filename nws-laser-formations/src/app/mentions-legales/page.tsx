import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales | NWS Laser Formations',
  description: 'Mentions légales de NWS Laser Formations',
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Mentions Légales
          </h1>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Éditeur du site</h2>
              <p className="text-gray-600">
                NWS Laser Formations<br />
                SIRET : 123 456 789 00015<br />
                Adresse : 123 Avenue de la Formation, 76000 Rouen<br />
                Téléphone : 02 35 XX XX XX<br />
                Email : contact@nws-laser-formations.fr
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Directeur de la publication</h2>
              <p className="text-gray-600">
                John Doe, Président de NWS Laser Formations
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hébergement</h2>
              <p className="text-gray-600">
                Ce site est hébergé par :<br />
                Société d'Hébergement<br />
                Adresse : 456 Rue des Serveurs, 75000 Paris<br />
                Téléphone : 01 XX XX XX XX
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-600">
                L'ensemble des éléments constituant le site NWS Laser Formations (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, etc.) ainsi que le site lui-même, sont la propriété exclusive de NWS Laser Formations ou de ses partenaires. Ces éléments sont protégés par les lois relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-600 mt-2">
                La reproduction ou représentation, intégrale ou partielle, des pages, des données et de toute autre élément constitutif du site, par quelque procédé ou support que ce soit, est interdite et constitue sans autorisation expresse et préalable de l'éditeur une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Protection des données personnelles</h2>
              <p className="text-gray-600">
                Les informations personnelles collectées sur ce site sont utilisées uniquement pour le traitement de vos demandes et l'accès à vos formations. En aucun cas ces informations ne seront transmises à des tiers. Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
              </p>
              <p className="text-gray-600 mt-2">
                Pour exercer ce droit, veuillez nous contacter par email à l'adresse : contact@nws-laser-formations.fr
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-600">
                Ce site utilise des cookies pour améliorer votre expérience de navigation. Ces cookies sont essentiels au fonctionnement du site et à la sécurité de votre compte. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Limitation de responsabilité</h2>
              <p className="text-gray-600">
                NWS Laser Formations ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications techniques requises, soit de l'apparition d'un bug ou d'une incompatibilité.
              </p>
              <p className="text-gray-600 mt-2">
                NWS Laser Formations ne pourra également être tenu responsable des dommages indirects consécutifs à l'utilisation du site.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Loi applicable et juridiction compétente</h2>
              <p className="text-gray-600">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
