import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component for dynamic meta tags
 * Usage: <SEO title="..." description="..." />
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  noindex = false 
}) => {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  // Default values (SEO-optimized: keyword-first, 140-160 char descriptions)
  const defaultTitle = 'Ricette Sarde Tradizionali | Cucina Tipica della Sardegna';
  const defaultDescription = 'Scopri le migliori ricette sarde tradizionali: primi, dolci, pane e piatti tipici della cucina della Sardegna spiegati passo passo.';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  
  const finalTitle = title ? `${title} | Ricette Sarde` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  
  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update or create meta tags
    const updateMetaTag = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`) || 
                    document.querySelector(`meta[name="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Primary meta tags
    updateMetaTag('title', finalTitle);
    updateMetaTag('description', finalDescription);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    // Open Graph tags
    updateMetaTag('og:title', finalTitle);
    updateMetaTag('og:description', finalDescription);
    updateMetaTag('og:type', type);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:image', finalImage);
    updateMetaTag('og:locale', 'it_IT');
    updateMetaTag('og:site_name', 'Sardegna Ricette e non solo');
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
    
    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }
  }, [finalTitle, finalDescription, finalImage, currentUrl, type, keywords, noindex]);
  
  return null;
};

export default SEO;
