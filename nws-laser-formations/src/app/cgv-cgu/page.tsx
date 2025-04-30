import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales | NWS Laser Formations',
  description: 'Conditions générales de vente et d\'utilisation de NWS Laser Formations',
};

export default function CGVCGUPage() {
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
            Conditions Générales de Vente et d'Utilisation
          </h1>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 1 - Objet</h2>
              <p className="text-gray-600">
                Les présentes Conditions Générales de Vente et d'Utilisation (ci-après "CGV/CGU") régissent les relations contractuelles entre la société NWS Laser Formations (ci-après "le Prestataire") et toute personne physique ou morale (ci-après "le Client") souhaitant accéder aux formations proposées sur le site nws-laser-formations.fr (ci-après "le Site").
              </p>
              <p className="text-gray-600 mt-2">
                Toute utilisation du Site implique l'acceptation pleine et entière des présentes CGV/CGU. Le Prestataire se réserve le droit de modifier à tout moment les présentes conditions en publiant une nouvelle version sur le Site.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 2 - Présentation des services</h2>
              <p className="text-gray-600">
                Le Site propose des formations en ligne dans le domaine des technologies laser. Ces formations sont constituées de différents modules comprenant des chapitres, des vidéos, des textes, des images et des quiz permettant d'évaluer les connaissances acquises.
              </p>
              <p className="text-gray-600 mt-2">
                Le Prestataire s'efforce de fournir des informations aussi précises que possible concernant les formations proposées. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 3 - Tarifs et modalités de paiement</h2>
              <p className="text-gray-600">
                Les prix des formations sont indiqués en euros, toutes taxes comprises. Le Prestataire se réserve le droit de modifier ses prix à tout moment, mais s'engage à appliquer les tarifs en vigueur au moment de la commande.
              </p>
              <p className="text-gray-600 mt-2">
                Le paiement s'effectue en ligne par carte bancaire. La commande validée par le Client ne sera considérée comme effective que lorsque le paiement aura été confirmé.
              </p>
              <p className="text-gray-600 mt-2">
                Des codes promotionnels peuvent être utilisés lors du paiement selon les conditions spécifiques de l'offre concernée.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 4 - Accès aux formations</h2>
              <p className="text-gray-600">
                Après validation du paiement, le Client aura immédiatement accès à la formation achetée. Cet accès est personnel, non cessible et valable pour une durée illimitée à compter de la date d'achat.
              </p>
              <p className="text-gray-600 mt-2">
                L'accès aux formations se fait via l'espace personnel du Client sur le Site, accessible avec ses identifiants de connexion (email et mot de passe) qu'il aura préalablement créés lors de son inscription.
              </p>
              <p className="text-gray-600 mt-2">
                Le Client est responsable de la préservation de la confidentialité de ses identifiants et des actions qui pourraient être faites sur son compte.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 5 - Certification</h2>
              <p className="text-gray-600">
                Certaines formations donnent droit à l'obtention d'un certificat lorsque le Client a suivi l'intégralité de la formation et a obtenu un score minimum de 80% au quiz final.
              </p>
              <p className="text-gray-600 mt-2">
                Le certificat est généré au format PDF et peut être téléchargé depuis l'espace personnel du Client sur le Site.
              </p>
              <p className="text-gray-600 mt-2">
                Ce certificat ne vaut pas diplôme d'État et atteste uniquement que le Client a suivi avec succès la formation concernée.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 6 - Propriété intellectuelle</h2>
              <p className="text-gray-600">
                L'ensemble des contenus présents sur le Site (textes, images, vidéos, quiz, etc.) sont la propriété exclusive du Prestataire ou de ses partenaires et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-600 mt-2">
                Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des contenus, par quelque procédé que ce soit, sans l'autorisation préalable écrite du Prestataire, est strictement interdite et constitue un délit de contrefaçon.
              </p>
              <p className="text-gray-600 mt-2">
                L'accès aux formations ne confère au Client qu'un droit d'usage privé, personnel et non cessible.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 7 - Droit de rétractation</h2>
              <p className="text-gray-600">
                Conformément à l'article L.121-21 du Code de la Consommation, le Client dispose d'un délai de 14 jours à compter de la date d'achat pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
              <p className="text-gray-600 mt-2">
                Toutefois, conformément à l'article L.121-21-8 du Code de la Consommation, le droit de rétractation ne peut être exercé pour les contenus numériques non fournis sur un support matériel dont l'exécution a commencé avec l'accord du Client et pour lesquels il a renoncé à son droit de rétractation.
              </p>
              <p className="text-gray-600 mt-2">
                En accédant à la formation achetée, le Client reconnaît que l'exécution du contrat a commencé et renonce expressément à son droit de rétractation.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 8 - Responsabilité</h2>
              <p className="text-gray-600">
                Le Prestataire s'engage à fournir les services avec diligence et selon les règles de l'art, étant précisé qu'il pèse sur lui une obligation de moyens.
              </p>
              <p className="text-gray-600 mt-2">
                Le Client reste responsable de l'utilisation qu'il fait des connaissances acquises lors des formations. Le Prestataire ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation faite par le Client du contenu des formations.
              </p>
              <p className="text-gray-600 mt-2">
                Le Prestataire ne garantit pas que les formations répondront aux besoins spécifiques du Client ni que les formations ne comporteront aucune erreur.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 9 - Protection des données personnelles</h2>
              <p className="text-gray-600">
                Les informations personnelles collectées lors de l'inscription et de l'utilisation du Site sont enregistrées dans un fichier informatisé par le Prestataire pour la gestion des comptes clients et l'accès aux formations.
              </p>
              <p className="text-gray-600 mt-2">
                Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), le Client dispose d'un droit d'accès, de rectification, d'effacement, et de portabilité des données le concernant, ainsi que du droit de s'opposer au traitement pour motif légitime.
              </p>
              <p className="text-gray-600 mt-2">
                Pour exercer ces droits, le Client peut contacter le Prestataire à l'adresse email suivante : contact@nws-laser-formations.fr
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 10 - Loi applicable et juridiction compétente</h2>
              <p className="text-gray-600">
                Les présentes CGV/CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français seront seuls compétents.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article 11 - Contact</h2>
              <p className="text-gray-600">
                Pour toute question relative aux présentes CGV/CGU ou au Site, vous pouvez contacter le Prestataire :
              </p>
              <p className="text-gray-600 mt-2">
                NWS Laser Formations<br />
                Adresse : 123 Avenue de la Formation, 76000 Rouen<br />
                Email : contact@nws-laser-formations.fr<br />
                Téléphone : 02 35 XX XX XX
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
