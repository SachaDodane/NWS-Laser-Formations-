import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité | NWS Laser Formations',
  description: 'Politique de confidentialité et protection des données personnelles de NWS Laser Formations',
};

export default function PolitiqueConfidentialitePage() {
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
            Politique de Confidentialité
          </h1>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600">
                Chez NWS Laser Formations, nous accordons une importance majeure à la protection de vos données personnelles. Cette politique de confidentialité décrit les informations que nous collectons, comment nous les utilisons et les mesures que nous prenons pour les protéger conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française "Informatique et Libertés".
              </p>
              <p className="text-gray-600 mt-2">
                En utilisant notre site web et nos services, vous acceptez les pratiques décrites dans la présente politique.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Collecte des données personnelles</h2>
              <p className="text-gray-600">
                Nous collectons les données personnelles suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Informations d'identification : nom, prénom, adresse email, numéro de téléphone</li>
                <li>Informations professionnelles : fonction, entreprise</li>
                <li>Informations de paiement : données de carte bancaire (traitées de manière sécurisée par notre prestataire de paiement)</li>
                <li>Données de connexion : identifiants, historique de connexion, adresse IP</li>
                <li>Données d'utilisation : formations suivies, résultats aux quiz, certificats obtenus</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Finalités du traitement</h2>
              <p className="text-gray-600">
                Vos données personnelles sont collectées et traitées pour les finalités suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Fourniture d'accès aux formations achetées</li>
                <li>Traitement des paiements</li>
                <li>Suivi de votre progression pédagogique</li>
                <li>Génération de certificats de réussite</li>
                <li>Communication concernant vos formations ou nos services</li>
                <li>Amélioration de nos services et de l'expérience utilisateur</li>
                <li>Respect de nos obligations légales et réglementaires</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Base légale du traitement</h2>
              <p className="text-gray-600">
                Le traitement de vos données personnelles est fondé sur les bases légales suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>L'exécution du contrat qui nous lie lorsque vous achetez une formation</li>
                <li>Votre consentement lorsque celui-ci est requis</li>
                <li>Notre intérêt légitime à développer et promouvoir nos services</li>
                <li>Le respect de nos obligations légales</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Durée de conservation des données</h2>
              <p className="text-gray-600">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités pour lesquelles elles ont été collectées, notamment :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Les données de votre compte utilisateur sont conservées tant que votre compte est actif</li>
                <li>Les données relatives à vos formations et certificats sont conservées pendant la durée de validité de vos accès aux formations</li>
                <li>Les données de facturation sont conservées pendant la durée légale requise (10 ans)</li>
                <li>Les données de connexion sont conservées pendant 1 an</li>
              </ul>
              <p className="text-gray-600 mt-2">
                À l'issue de ces périodes, vos données personnelles sont supprimées ou anonymisées.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Destinataires des données</h2>
              <p className="text-gray-600">
                Vos données personnelles sont destinées :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Aux services internes de NWS Laser Formations habilités à traiter vos données</li>
                <li>À nos sous-traitants qui agissent sur nos instructions et pour notre compte (hébergement, paiement, emailing)</li>
              </ul>
              <p className="text-gray-600 mt-2">
                Nous ne vendons jamais vos données personnelles à des tiers. Nous ne les partageons avec des tiers que dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Avec votre consentement explicite</li>
                <li>Pour traiter vos paiements en toute sécurité</li>
                <li>Pour respecter nos obligations légales</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transfert des données hors UE</h2>
              <p className="text-gray-600">
                En principe, vos données personnelles sont stockées et traitées au sein de l'Union Européenne. Si un transfert de données vers un pays tiers était nécessaire, nous mettrions en place les garanties appropriées conformément à la réglementation applicable pour assurer un niveau de protection adéquat de vos données.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sécurité des données</h2>
              <p className="text-gray-600">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre la destruction accidentelle ou illicite, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé, notamment :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Chiffrement des données sensibles</li>
                <li>Accès limité aux personnes habilitées</li>
                <li>Authentification sécurisée</li>
                <li>Sauvegardes régulières</li>
                <li>Mises à jour de sécurité</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vos droits</h2>
              <p className="text-gray-600">
                Conformément à la réglementation applicable, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li><strong>Droit d'accès</strong> : vous pouvez obtenir une copie des données personnelles que nous détenons à votre sujet</li>
                <li><strong>Droit de rectification</strong> : vous pouvez demander la correction des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement</strong> : vous pouvez demander la suppression de vos données dans certains cas</li>
                <li><strong>Droit à la limitation du traitement</strong> : vous pouvez demander la limitation du traitement de vos données</li>
                <li><strong>Droit à la portabilité</strong> : vous pouvez demander à recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : vous pouvez vous opposer au traitement de vos données dans certains cas</li>
                <li><strong>Droit de retirer votre consentement</strong> à tout moment lorsque le traitement est basé sur votre consentement</li>
                <li><strong>Droit de définir des directives</strong> relatives au sort de vos données après votre décès</li>
              </ul>
              <p className="text-gray-600 mt-2">
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse email suivante : rgpd@nws-laser-formations.fr ou par courrier à l'adresse : NWS Laser Formations, 123 Avenue de la Formation, 76000 Rouen.
              </p>
              <p className="text-gray-600 mt-2">
                Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL).
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-600">
                Notre site utilise des cookies pour améliorer votre expérience utilisateur et nous permettre d'analyser la fréquentation du site. Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site.
              </p>
              <p className="text-gray-600 mt-2">
                Nous utilisons les types de cookies suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site et à la sécurisation de votre compte</li>
                <li><strong>Cookies fonctionnels</strong> : permettent de mémoriser vos préférences</li>
                <li><strong>Cookies analytiques</strong> : nous aident à comprendre comment les visiteurs interagissent avec le site</li>
              </ul>
              <p className="text-gray-600 mt-2">
                Vous pouvez configurer votre navigateur pour refuser tous les cookies ou être informé quand un cookie est envoyé. Cependant, certaines fonctionnalités du site pourraient ne pas fonctionner correctement si vous désactivez les cookies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Modification de la politique de confidentialité</h2>
              <p className="text-gray-600">
                Nous pouvons être amenés à modifier cette politique de confidentialité pour refléter les changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
              </p>
              <p className="text-gray-600 mt-2">
                En cas de modification substantielle, nous vous en informerons par email ou par une notification visible sur notre site. Nous vous encourageons à consulter régulièrement cette page pour être informé des mises à jour.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-600">
                Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, vous pouvez contacter notre délégué à la protection des données :
              </p>
              <p className="text-gray-600 mt-2">
                Email : rgpd@nws-laser-formations.fr<br />
                Adresse : NWS Laser Formations, 123 Avenue de la Formation, 76000 Rouen<br />
                Téléphone : 02 35 XX XX XX
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
