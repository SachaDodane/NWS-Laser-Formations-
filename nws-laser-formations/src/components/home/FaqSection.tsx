'use client';

import { useState } from 'react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqItems: FaqItem[] = [
    {
      id: 1,
      question: "Comment accéder à mes formations après inscription ?",
      answer: "Après votre inscription et paiement, vous aurez immédiatement accès à toutes vos formations depuis votre tableau de bord personnel. Il vous suffit de vous connecter et de cliquer sur 'Mes Formations' dans le menu principal."
    },
    {
      id: 2,
      question: "Les formations sont-elles accessibles à vie ?",
      answer: "Oui, une fois que vous avez acheté une formation, vous y avez accès à vie. Vous pourrez la consulter à votre rythme et y revenir autant de fois que nécessaire, même après l'avoir complétée."
    },
    {
      id: 3,
      question: "Les certificats délivrés sont-ils reconnus par l'industrie ?",
      answer: "Absolument. Nos certificats sont reconnus par les professionnels de l'industrie laser et peuvent être ajoutés à votre CV ou profil LinkedIn. Ils attestent des compétences spécifiques que vous avez acquises dans le domaine de la technologie laser."
    },
    {
      id: 4,
      question: "Puis-je suivre les formations sur mobile ?",
      answer: "Oui, notre plateforme est entièrement responsive et optimisée pour tous les appareils. Vous pouvez suivre vos formations sur ordinateur, tablette ou smartphone, ce qui vous permet d'apprendre où que vous soyez."
    },
    {
      id: 5,
      question: "Y a-t-il un support technique disponible en cas de problème ?",
      answer: "Oui, notre équipe de support technique est disponible par email et chat du lundi au vendredi de 9h à 18h. Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 heures ouvrées."
    },
    {
      id: 6,
      question: "Proposez-vous des formations pour débutants complets ?",
      answer: "Oui, nous proposons des formations pour tous les niveaux, des débutants aux experts. Chaque formation indique clairement le niveau requis pour la suivre, et nos formations de base sont conçues pour être accessibles même sans connaissances préalables."
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600">
            Vous avez des questions ? Nous avons les réponses.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 card-hover"
            >
              <button
                className="w-full text-left p-6 focus:outline-none flex justify-between items-center"
                onClick={() => toggleItem(item.id)}
                aria-expanded={openItem === item.id}
              >
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {item.question}
                </h3>
                <svg
                  className={`h-6 w-6 text-blue-600 transform transition-transform duration-300 ${
                    openItem === item.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openItem === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 border-t border-gray-100">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Contactez-nous
            <svg
              className="ml-2 -mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
