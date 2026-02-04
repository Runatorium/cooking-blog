import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI, MEDIA_BASE_URL } from '../services/api';
import Footer from './Footer';
import SEO from './SEO';
import './LandingPage.css';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [redazioneRecipes, setRedazioneRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    fetchRedazioneRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeAPI.getRecipes();
      setRecipes(data.results || data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedazioneRecipes = async () => {
    try {
      const data = await recipeAPI.getRecipes('', '', null, null, null, true);
      setRedazioneRecipes(data.results || data);
    } catch (err) {
      console.error('Error fetching redazione recipes:', err);
      setRedazioneRecipes([]);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get image placeholder class based on category
  const getImageClass = (category) => {
    const categoryMap = {
      'Pane & Pizza': 'lasagna',
      'Primi Piatti': 'gnocchi',
      'Carne & Pollame': 'lasagna',
      'Dolci': 'tiramisu',
      'Pesce': 'ribollita',
    };
    return categoryMap[category] || 'lasagna';
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'Bread & Pizza': 'Pane & Pizza',
      'Pasta Dishes': 'Primi Piatti',
      'Meat & Poultry': 'Carne & Pollame',
      'Desserts': 'Dolci',
      'Fish': 'Pesce',
    };
    return categoryMap[category] || category;
  };

  const featuredRecipe = recipes.length > 0 ? recipes[0] : null;
  // Ultime Ricette Tradizionali: only from Redazione (editorial), max 3
  const latestRecipes = redazioneRecipes.slice(0, 3);

  // Count recipes by category
  const getCategoryCount = (displayCategory) => {
    const categoryMap = {
      'Pane & Pizza': 'Bread & Pizza',
      'Primi Piatti': 'Pasta Dishes',
      'Carne & Pollame': 'Meat & Poultry',
      'Dolci': 'Desserts',
      'Pesce': 'Fish',
    };
    const dbCategory = categoryMap[displayCategory];
    return recipes.filter(recipe => recipe.category === dbCategory).length;
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Email submitted:', email);
    setEmail('');
    alert('Grazie per esserti iscritto!');
  };

  return (
    <div className="landing-page">
      <SEO
        title="Ricette Autentiche dal Cuore della Sardegna"
        description="Scopri le ricette tradizionali sarde tramandate nel tempo. Ricette senza glutine, senza lattosio, primi piatti, dolci e molto altro dalla cucina tradizionale sarda."
        keywords="ricette sarde, cucina tradizionale sarda, ricette senza glutine, ricette senza lattosio, culurgiones, seadas, ricette italiane"
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Ricette Autentiche dal Cuore della Sardegna</h1>
          <p className="hero-description">
            Scopri le ricette tradizionali sarde tramandate nel tempo, le tradizioni culinarie dell'isola e le storie dietro ogni piatto che raccontano la nostra terra e la nostra cultura.
          </p>
        </div>
      </section>

      {/* Featured Recipe Section */}
      <section className="featured-recipe-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ricetta in Evidenza</h2>
            {featuredRecipe && (
              <div className="editor-choice">
                <span className="star-icon">⭐</span>
                <span>Scelta della Redazione</span>
              </div>
            )}
          </div>
          {featuredRecipe ? (
            <div className={`featured-recipe-card ${featuredRecipe.author?.is_redazione ? 'featured-recipe-card--redazione' : ''}`}>
              <div className="featured-recipe-image">
                {featuredRecipe.image ? (
                  <img 
                    src={featuredRecipe.image.startsWith('http') ? featuredRecipe.image : `${MEDIA_BASE_URL}${featuredRecipe.image}`}
                    alt={featuredRecipe.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className={`recipe-image-placeholder ${getImageClass(featuredRecipe.category)}`}></div>
                )}
              </div>
              <div className="featured-recipe-content">
                <div className="recipe-tags">
                  {featuredRecipe.author?.is_redazione && <span className="redazione-badge">Redazione</span>}
                  <span className="tag tag-main">{getCategoryDisplayName(featuredRecipe.category)}</span>
                  <span className="tag tag-time">🕐 {featuredRecipe.prep_time} min</span>
                  <span className="tag tag-likes">🤍 {featuredRecipe.likes_count || 0}</span>
                </div>
                <h3 className="recipe-title">{featuredRecipe.title}</h3>
                <p className="recipe-description">
                  {featuredRecipe.description}
                </p>
                <div className="recipe-author">
                  <div className={`author-avatar ${featuredRecipe.author?.is_redazione ? 'author-avatar--redazione' : ''}`} title={featuredRecipe.author?.is_redazione ? 'Redazione' : undefined}>
                    {featuredRecipe.author?.is_redazione ? (
                      <span className="author-avatar-redazione-icon" aria-hidden>👨‍🍳</span>
                    ) : (
                      featuredRecipe.author?.display_name ? featuredRecipe.author.display_name.charAt(0).toUpperCase() : (featuredRecipe.author?.name ? featuredRecipe.author.name.charAt(0).toUpperCase() : 'U')
                    )}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{featuredRecipe.author?.display_name || featuredRecipe.author?.name || 'Autore Sconosciuto'}</span>
                    <span className="recipe-date">{formatDate(featuredRecipe.created_at)}</span>
                  </div>
                </div>
                <Link to={`/recipe/${featuredRecipe.slug || featuredRecipe.id}`} className="btn-view-recipe">Vedi Ricetta Completa</Link>
              </div>
            </div>
          ) : (
            <div className="featured-recipe-card">
              <div className="featured-recipe-image">
                <div className="recipe-image-placeholder lasagna"></div>
              </div>
              <div className="featured-recipe-content">
                <div className="recipe-tags">
                  <span className="tag tag-main">Primo Piatto</span>
                  <span className="tag tag-time">🕐 90 min</span>
                </div>
                <h3 className="recipe-title">Culurgiones Sardi Tradizionali</h3>
                <p className="recipe-description">
                  Una ricetta di famiglia preziosa tramandata di generazione in generazione. Questi autentici culurgiones sardi presentano una pasta fresca fatta in casa, un ripieno cremoso di patate e menta, e la tradizione che si scioglie in bocca.
                </p>
                <div className="recipe-author">
                  <div className="author-avatar">MB</div>
                  <div className="author-info">
                    <span className="author-name">Maria Benedetti</span>
                    <span className="recipe-date">28 Ottobre 2023</span>
                  </div>
                </div>
                <button className="btn-view-recipe">Vedi Ricetta Completa</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Recipes Section */}
      <section className="latest-recipes-section">
        <div className="container">
          <h2 className="section-title">Ultime Ricette Tradizionali</h2>
          <div className="recipes-grid">
            {latestRecipes.length > 0 ? (
              latestRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipe/${recipe.slug || recipe.id}`} className={`recipe-card ${recipe.author?.is_redazione ? 'recipe-card--redazione' : ''}`}>
                  <div className={`recipe-card-image ${!recipe.image ? getImageClass(recipe.category) : ''}`}>
                    {recipe.image && (
                      <img 
                        src={recipe.image.startsWith('http') ? recipe.image : `${MEDIA_BASE_URL}${recipe.image}`}
                        alt={recipe.title}
                      />
                    )}
                  </div>
                  <div className="recipe-card-content">
                    <div className="recipe-tags">
                      {recipe.author?.is_redazione && <span className="redazione-badge">Redazione</span>}
                      <span className={`tag tag-${recipe.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}>
                        {getCategoryDisplayName(recipe.category)}
                      </span>
                      <span className="tag tag-time">🕐 {recipe.prep_time} min</span>
                    </div>
                    <h4>{recipe.title}</h4>
                    <p>{recipe.description}</p>
                    <div className="recipe-card-author">
                      <span>Di {recipe.author?.display_name || recipe.author?.name || 'Autore Sconosciuto'} • {formatDate(recipe.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <div className="recipe-card">
                  <div className="recipe-card-image gnocchi"></div>
                  <div className="recipe-card-content">
                    <div className="recipe-tags">
                      <span className="tag tag-pasta">Pasta</span>
                      <span className="tag tag-time">🕐 45 mins</span>
                    </div>
                    <h4>Gnocchi Sardi con Pomodoro e Basilico</h4>
                    <p>Gnocchi sardi tradizionali leggeri e soffici fatti in casa usando la tecnica tramandata per una consistenza perfetta.</p>
                    <div className="recipe-card-author">
                      <span>Di Elena Rossi • 25 Ott 2023</span>
                    </div>
                  </div>
                </div>
                <div className="recipe-card">
                  <div className="recipe-card-image ribollita"></div>
                  <div className="recipe-card-content">
                    <div className="recipe-tags">
                      <span className="tag tag-soup">Zuppa</span>
                      <span className="tag tag-time">🕐 60 min</span>
                    </div>
                    <h4>Zuppa Gallurese</h4>
                    <p>Una zuppa tradizionale sarda sostanziosa fatta con pane carasau, formaggio e brodo - conforto in ogni cucchiaio.</p>
                    <div className="recipe-card-author">
                      <span>Di Giuseppe Marino • 22 Ott 2023</span>
                    </div>
                  </div>
                </div>
                <div className="recipe-card">
                  <div className="recipe-card-image tiramisu"></div>
                  <div className="recipe-card-content">
                    <div className="recipe-tags">
                      <span className="tag tag-dessert">Dolce</span>
                      <span className="tag tag-time">🕐 30 min</span>
                    </div>
                    <h4>Seadas Sarde</h4>
                    <p>Il classico dolce sardo con pasta fritta croccante, formaggio fresco e miele amaro - un'antica tradizione dell'isola.</p>
                    <div className="recipe-card-author">
                      <span>Di Lucia Bianchi • 20 Ott 2023</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Explore by Category Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Esplora per Categoria</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">🍞</div>
              <h3>Pane & Pizza</h3>
              <p>{getCategoryCount('Pane & Pizza')} {getCategoryCount('Pane & Pizza') === 1 ? 'ricetta' : 'ricette'}</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🍝</div>
              <h3>Primi Piatti</h3>
              <p>{getCategoryCount('Primi Piatti')} {getCategoryCount('Primi Piatti') === 1 ? 'ricetta' : 'ricette'}</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🍗</div>
              <h3>Carne & Pollame</h3>
              <p>{getCategoryCount('Carne & Pollame')} {getCategoryCount('Carne & Pollame') === 1 ? 'ricetta' : 'ricette'}</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🍰</div>
              <h3>Dolci</h3>
              <p>{getCategoryCount('Dolci')} {getCategoryCount('Dolci') === 1 ? 'ricetta' : 'ricette'}</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🐟</div>
              <h3>Pesce</h3>
              <p>{getCategoryCount('Pesce')} {getCategoryCount('Pesce') === 1 ? 'ricetta' : 'ricette'}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
