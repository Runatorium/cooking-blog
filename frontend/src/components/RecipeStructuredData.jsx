import { useEffect } from 'react';
import { MEDIA_BASE_URL } from '../services/api';

/**
 * Component to add Recipe structured data (Schema.org) for SEO
 */
const RecipeStructuredData = ({ recipe }) => {
  useEffect(() => {
    if (!recipe) return;
    
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    const recipeUrl = `${baseUrl}/recipe/${recipe.slug || recipe.id}`;
    const imageUrl = recipe.image 
      ? (recipe.image.startsWith('http') ? recipe.image : `${MEDIA_BASE_URL}${recipe.image}`)
      : `${baseUrl}/recipe-placeholder.jpg`;
    
    // Format ingredients array
    const ingredients = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients 
      : (recipe.ingredients || []).split(',').map(i => i.trim()).filter(i => i);
    
    // Format instructions array
    const instructions = Array.isArray(recipe.instructions)
      ? recipe.instructions
      : (recipe.instructions || []).split('\n').map(i => i.trim()).filter(i => i);
    
    // Category mapping
    const categoryMap = {
      'Bread & Pizza': 'Pane & Pizza',
      'Pasta Dishes': 'Primi Piatti',
      'Meat & Poultry': 'Carne & Pollame',
      'Desserts': 'Dolci',
      'Fish': 'Pesce',
    };
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.title,
      description: recipe.description,
      image: imageUrl,
      author: {
        '@type': recipe.author?.is_redazione ? 'Organization' : 'Person',
        name: recipe.author?.display_name || recipe.author?.name || 'Autore Sconosciuto',
      },
      datePublished: recipe.created_at,
      dateModified: recipe.updated_at || recipe.created_at,
      prepTime: `PT${recipe.prep_time}M`,
      recipeCategory: categoryMap[recipe.category] || recipe.category,
      recipeCuisine: recipe.is_sardinian ? 'Italian' : 'Italian',
      recipeYield: '4-6 porzioni',
      keywords: [
        'ricette sarde',
        'cucina tradizionale',
        recipe.is_sardinian ? 'ricetta sarda' : '',
        recipe.gluten_free ? 'senza glutine' : '',
        recipe.lactose_free ? 'senza lattosio' : '',
        categoryMap[recipe.category] || recipe.category,
      ].filter(k => k).join(', '),
      recipeIngredient: ingredients,
      recipeInstructions: instructions.map((instruction, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: instruction,
      })),
      aggregateRating: recipe.likes_count > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: recipe.likes_count.toString(),
      } : undefined,
      nutrition: {
        '@type': 'NutritionInformation',
        ...(recipe.gluten_free && { glutenFree: 'https://schema.org/GlutenFreeDiet' }),
        ...(recipe.lactose_free && { lactoseFree: 'https://schema.org/LactoseFreeDiet' }),
      },
    };
    
    // Remove undefined fields
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });
    
    // Remove or add script tag
    let scriptTag = document.getElementById('recipe-structured-data');
    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(structuredData);
    } else {
      scriptTag = document.createElement('script');
      scriptTag.id = 'recipe-structured-data';
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(structuredData);
      document.head.appendChild(scriptTag);
    }
    
    return () => {
      // Cleanup on unmount
      const script = document.getElementById('recipe-structured-data');
      if (script) {
        script.remove();
      }
    };
  }, [recipe]);
  
  return null;
};

export default RecipeStructuredData;
