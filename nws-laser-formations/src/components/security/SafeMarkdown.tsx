import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Composant pour rendre du markdown de manière sécurisée
 * Utilise DOMPurify pour nettoyer le HTML et éviter les attaques XSS
 */
const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, className }) => {
  // Configurer DOMPurify pour autoriser uniquement certaines balises et attributs
  const purifyConfig = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'em', 'strong', 'del', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'title'
    ],
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'button'],
    ADD_ATTR: ['target'], // Pour ajouter target="_blank" aux liens
    USE_PROFILES: { html: true },
    FORBID_ATTR: ['onerror', 'onload', 'style'],
  };

  // Convertir le markdown en HTML
  const rawHtml = marked(content || '');
  
  // Nettoyer le HTML pour éviter les scripts malveillants
  const cleanHtml = DOMPurify.sanitize(rawHtml, purifyConfig);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default SafeMarkdown;
