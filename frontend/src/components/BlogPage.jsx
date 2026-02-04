import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import Footer from './Footer';
import SEO from './SEO';
import './BlogPage.css';

const BlogPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [filterLactoseFree, setFilterLactoseFree] = useState(false);
  const [filterSardinian, setFilterSardinian] = useState(false);
  const [filterRedazione, setFilterRedazione] = useState(false);
  const [orderBy, setOrderBy] = useState(''); // '' = newest, 'most_liked' = most liked
  const [recipes, setRecipes] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({}); // unfiltered counts per backend category
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [likingIds, setLikingIds] = useState(new Set());
  const initialLoadDone = useRef(false);
  const [searchParams] = useSearchParams();

  // Map Italian category names to backend category values
  const categoryMap = {
    'Pane & Pizza': 'Bread & Pizza',
    'Primi Piatti': 'Pasta Dishes',
    'Carne & Pollame': 'Meat & Poultry',
    'Dolci': 'Desserts',
    'Pesce': 'Fish',
  };
  const validCategoryNames = Object.keys(categoryMap);

  // Reverse map for display
  const reverseCategoryMap = {
    'Bread & Pizza': 'Pane & Pizza',
    'Pasta Dishes': 'Primi Piatti',
    'Meat & Poultry': 'Carne & Pollame',
    'Desserts': 'Dolci',
    'Fish': 'Pesce',
  };

  const fetchRecipes = async (search = '', category = '', glutenFree = null, lactoseFree = null, isSardinian = null, redazioneOnly = false, orderByParam = '', silent = false) => {
    try {
      if (silent) {
        setSearching(true);
      } else {
        setLoading(true);
      }
      setError('');
      const backendCategory = category ? categoryMap[category] || category : '';
      const data = await recipeAPI.getRecipes(search, backendCategory, glutenFree, lactoseFree, isSardinian, redazioneOnly, orderByParam);
      setRecipes(data.results || data);
    } catch (err) {
      setError('Impossibile caricare le ricette. Riprova più tardi.');
      console.error('Error fetching recipes:', err);
    } finally {
      if (silent) {
        setSearching(false);
      } else {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const category = validCategoryNames.includes(categoryFromUrl || '') ? categoryFromUrl : '';
    if (category) setSelectedCategory(category);
    fetchRecipes('', category, null, null, null, false, '', false);
    recipeAPI.getCategoryCounts().then(setCategoryCounts).catch(() => setCategoryCounts({}));
  }, []);

  // Sync URL category to state when navigating (e.g. from footer links)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const category = validCategoryNames.includes(categoryFromUrl || '') ? categoryFromUrl : '';
    setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    const glutenFree = filterGlutenFree ? true : null;
    const lactoseFree = filterLactoseFree ? true : null;
    const isSardinian = filterSardinian ? true : null;
    const ms = searchQuery ? 650 : 0;
    const timeoutId = setTimeout(() => {
      fetchRecipes(searchQuery, selectedCategory, glutenFree, lactoseFree, isSardinian, filterRedazione, orderBy, true);
    }, ms);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, filterGlutenFree, filterLactoseFree, filterSardinian, filterRedazione, orderBy]);

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // Deselect if clicking the same category
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  const handleLike = async (recipeId, recipe) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLikingIds(prev => new Set(prev).add(recipeId));
      const response = await recipeAPI.likeRecipe(recipeId);
      
      // Update the recipe in the list
      setRecipes(prevRecipes => 
        prevRecipes.map(r => 
          r.id === recipeId 
            ? { ...r, is_liked: response.liked, likes_count: response.likes_count }
            : r
        )
      );
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert('Impossibile mettere like alla ricetta. Riprova più tardi.');
    } finally {
      setLikingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  // Count recipes by category (from unfiltered backend counts so cards don't change when filters are applied)
  const getCategoryCount = (category) => {
    const backendCategory = categoryMap[category];
    return categoryCounts[backendCategory] ?? 0;
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
      'Pasta Dishes': 'gnocchi',
      'Soup': 'ribollita',
      'Desserts': 'tiramisu',
      'Main Course': 'lasagna',
      'Bread & Pizza': 'lasagna',
      'Meat & Poultry': 'lasagna',
      'Fish': 'ribollita',
    };
    return categoryMap[category] || 'lasagna';
  };

  // Placeholder recipes for testing filters
  const placeholderRecipes = [
    {
      id: 'placeholder-1',
      title: 'Culurgiones Sardi',
      description: 'Pasta fresca ripiena di patate e menta',
      category: 'Primi Piatti',
      prep_time: 60,
      created_at: '2023-10-25',
      author: { name: 'Maria' },
    },
    {
      id: 'placeholder-2',
      title: 'Pane Carasau',
      description: 'Il pane sardo tradizionale croccante',
      category: 'Pane & Pizza',
      prep_time: 120,
      created_at: '2023-10-22',
      author: { name: 'Giuseppe' },
    },
    {
      id: 'placeholder-3',
      title: 'Porceddu',
      description: 'Maialino da latte arrosto sardo',
      category: 'Carne & Pollame',
      prep_time: 180,
      created_at: '2023-10-20',
      author: { name: 'Antonio' },
    },
    {
      id: 'placeholder-4',
      title: 'Seadas',
      description: 'Dolce fritto con formaggio e miele',
      category: 'Dolci',
      prep_time: 45,
      created_at: '2023-10-18',
      author: { name: 'Lucia' },
    },
    {
      id: 'placeholder-5',
      title: 'Bottarga di Muggine',
      description: 'Uova di muggine essiccate',
      category: 'Pesce',
      prep_time: 30,
      created_at: '2023-10-15',
      author: { name: 'Paolo' },
    },
  ];

  // Filter recipes based on search and category
  const filteredPosts = useMemo(() => {
    const postsToFilter = recipes.length > 0 ? recipes : placeholderRecipes;
    
    let filtered = postsToFilter;

    // Filter by selected category
    if (selectedCategory) {
      const backendCategory = categoryMap[selectedCategory];
      filtered = filtered.filter(recipe => recipe.category === backendCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        ((recipe.author?.name && recipe.author.name.toLowerCase().includes(query)) ||
         (recipe.author?.display_name && recipe.author.display_name.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [recipes, selectedCategory, searchQuery]);

  // Display order: first up to 3 from Redazione that match filters, then the rest
  const orderedPosts = useMemo(() => {
    const redazioneFirst = filteredPosts.filter(r => r.author?.is_redazione).slice(0, 3);
    const redazioneIds = new Set(redazioneFirst.map(r => r.id));
    const rest = filteredPosts.filter(r => !redazioneIds.has(r.id));
    return [...redazioneFirst, ...rest];
  }, [filteredPosts]);

  const categoryName = selectedCategory 
    ? (categoryMap[selectedCategory] || selectedCategory)
    : null;
  
  const seoTitle = categoryName 
    ? `Ricette ${categoryName} - Sardegna Ricette e non solo`
    : 'Ricette Tradizionali Sarde - Sardegna Ricette e non solo';
  
  const seoDescription = categoryName
    ? `Scopri le migliori ricette ${String(categoryName).toLowerCase()} tradizionali sarde. Ricette autentiche tramandate di generazione in generazione.`
    : 'Esplora la collezione completa di ricette tradizionali sarde. Ricette senza glutine, senza lattosio, primi piatti, dolci e molto altro dalla cucina sarda.';

  return (
    <div className="blog-page">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`ricette sarde, ${categoryName ? String(categoryName).toLowerCase() : 'cucina tradizionale sarda'}, ricette senza glutine, ricette senza lattosio`}
      />
      {/* Main Content */}
      <main className="blog-main">
        <div className="blog-container">
          <header className="blog-header">
            <h1>Ricette Tradizionali Sarde</h1>
            <p>Scopri le autentiche ricette della Sardegna tramandate di generazione in generazione</p>
          </header>

          {/* Categories Section */}
          <section className="blog-categories-section">
            <div className="blog-categories-grid">
              <div 
                className={`blog-category-card ${selectedCategory === 'Pane & Pizza' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Pane & Pizza')}
              >
                <div className="blog-category-icon">🍞</div>
                <h3>Pane & Pizza</h3>
                <p>{getCategoryCount('Pane & Pizza')} ricette</p>
              </div>
              <div 
                className={`blog-category-card ${selectedCategory === 'Primi Piatti' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Primi Piatti')}
              >
                <div className="blog-category-icon">🍝</div>
                <h3>Primi Piatti</h3>
                <p>{getCategoryCount('Primi Piatti')} ricette</p>
              </div>
              <div 
                className={`blog-category-card ${selectedCategory === 'Carne & Pollame' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Carne & Pollame')}
              >
                <div className="blog-category-icon">🍗</div>
                <h3>Carne & Pollame</h3>
                <p>{getCategoryCount('Carne & Pollame')} ricette</p>
              </div>
              <div 
                className={`blog-category-card ${selectedCategory === 'Dolci' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Dolci')}
              >
                <div className="blog-category-icon">🍰</div>
                <h3>Dolci</h3>
                <p>{getCategoryCount('Dolci')} ricette</p>
              </div>
              <div 
                className={`blog-category-card ${selectedCategory === 'Pesce' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Pesce')}
              >
                <div className="blog-category-icon">🐟</div>
                <h3>Pesce</h3>
                <p>{getCategoryCount('Pesce')} ricette</p>
              </div>
            </div>

            {/* Category Filter Info */}
            {selectedCategory && (
              <div className="category-filter-info">
                <span>Filtro attivo: <strong>{selectedCategory}</strong></span>
                <button 
                  className="btn-clear-filter"
                  onClick={() => setSelectedCategory('')}
                >
                  Rimuovi filtro
                </button>
              </div>
            )}
          </section>

          {/* Search Section */}
          <section className="search-section">
            <div className={`search-container ${searching ? 'search-container--searching' : ''}`}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Cerca ricette, ingredienti, autori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searching && <span className="searching-indicator" aria-hidden>Cercando...</span>}
              {searchQuery && !searching && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Cancella ricerca"
                >
                  ×
                </button>
              )}
            </div>
            <div className="search-diet-filters">
              <label className="search-diet-checkbox">
                <input
                  type="checkbox"
                  checked={filterGlutenFree}
                  onChange={(e) => setFilterGlutenFree(e.target.checked)}
                  className="search-diet-input"
                />
                <span className="search-diet-label">🌾 Senza glutine</span>
              </label>
              <label className="search-diet-checkbox">
                <input
                  type="checkbox"
                  checked={filterLactoseFree}
                  onChange={(e) => setFilterLactoseFree(e.target.checked)}
                  className="search-diet-input"
                />
                <span className="search-diet-label">🥛 Senza lattosio</span>
              </label>
              <label className="search-diet-checkbox">
                <input
                  type="checkbox"
                  checked={filterSardinian}
                  onChange={(e) => setFilterSardinian(e.target.checked)}
                  className="search-diet-input"
                />
                <span className="search-diet-label">🏝️ Ricette Sarde</span>
              </label>
              <label className="search-diet-checkbox">
                <input
                  type="checkbox"
                  checked={filterRedazione}
                  onChange={(e) => setFilterRedazione(e.target.checked)}
                  className="search-diet-input"
                />
                <span className="search-diet-label">👨‍🍳 Solo Redazione</span>
              </label>
            </div>
            <div className="search-order-by">
              <span className="search-order-label">Ordina per:</span>
              <button
                type="button"
                className={`search-order-btn ${orderBy === '' ? 'active' : ''}`}
                onClick={() => setOrderBy('')}
              >
                Più recenti
              </button>
              <button
                type="button"
                className={`search-order-btn ${orderBy === 'most_liked' ? 'active' : ''}`}
                onClick={() => setOrderBy(orderBy === 'most_liked' ? '' : 'most_liked')}
              >
                Più piaciute
              </button>
            </div>
            {searchQuery && !searching && (
              <div className="search-results-info">
                {orderedPosts.length} risultato{orderedPosts.length !== 1 ? 'i' : ''} trovato{orderedPosts.length !== 1 ? 'i' : ''} per "{searchQuery}"
              </div>
            )}
          </section>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner">Caricamento ricette...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => fetchRecipes(searchQuery, selectedCategory, filterGlutenFree ? true : null, filterLactoseFree ? true : null, filterSardinian ? true : null, filterRedazione, orderBy, false)} className="btn-retry">Riprova</button>
            </div>
          )}

          {/* Blog Posts Grid - stay visible while searching, only hide on initial load */}
          {!loading && !error && (orderedPosts.length > 0 || recipes.length === 0) && (
            <div className={`blog-posts ${searching ? 'blog-posts--searching' : ''}`}>
              {orderedPosts.length > 0 ? (
                orderedPosts.map((recipe) => (
                  <article key={recipe.id} className={`blog-post-card ${recipe.author?.is_redazione ? 'blog-post-card--redazione' : ''}`}>
                    <div className="post-image">
                      {recipe.image ? (
                        <img 
                          src={recipe.image.startsWith('http') ? recipe.image : `http://localhost:8000${recipe.image}`}
                          alt={recipe.title}
                          className="post-image-img"
                        />
                      ) : (
                        <div className={`post-image-placeholder ${getImageClass(recipe.category)}`}></div>
                      )}
                    </div>
                    <div className="post-content">
                      <div className="post-meta">
                        {recipe.author?.is_redazione && <span className="redazione-badge">Redazione</span>}
                        <span className="post-category">{reverseCategoryMap[recipe.category] || recipe.category}</span>
                        {(recipe.gluten_free || recipe.lactose_free) && (
                          <div className="dietary-badges-card">
                            {recipe.gluten_free && <span className="dietary-badge-card" title="Senza Glutine">🌾</span>}
                            {recipe.lactose_free && <span className="dietary-badge-card" title="Senza Lattosio">🥛</span>}
                          </div>
                        )}
                        <span className="post-date">{formatDate(recipe.created_at)}</span>
                      </div>
                      <h2 className="post-title">{recipe.title}</h2>
                      <p className="post-excerpt">{recipe.description}</p>
                      <div className="post-footer">
                        <div className="post-author">
                          <span className="author-name">{recipe.author?.display_name || recipe.author?.name || 'Unknown'}</span>
                          <span className="read-time">{recipe.prep_time} min prep</span>
                        </div>
                        <div className="post-actions">
                          {isAuthenticated && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLike(recipe.id, recipe);
                              }}
                              className={`btn-like-small ${recipe.is_liked ? 'liked' : ''}`}
                              disabled={likingIds.has(recipe.id)}
                              title={recipe.is_liked ? 'Rimuovi like' : 'Metti like'}
                            >
                              <span className="like-icon-small">{recipe.is_liked ? '❤️' : '🤍'}</span>
                              <span className="like-count-small">{recipe.likes_count || 0}</span>
                            </button>
                          )}
                          {!isAuthenticated && (
                            <div className="like-info-small">
                              <span className="like-icon-small">🤍</span>
                              <span className="like-count-small">{recipe.likes_count || 0}</span>
                            </div>
                          )}
                          <Link to={`/recipe/${recipe.slug || recipe.id}`} className="read-more">
                            Leggi di Più →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : recipes.length === 0 ? (
                // Placeholder recipes for testing - filtered by selectedCategory
                filteredPosts.map((recipe, index) => {
                  const imageClass = recipe.category === 'Primi Piatti' ? 'gnocchi' :
                                    recipe.category === 'Dolci' ? 'tiramisu' :
                                    recipe.category === 'Pesce' ? 'ribollita' : 'lasagna';
                  
                  return (
                    <article key={index} className="blog-post-card">
                      <div className="post-image">
                        <div className={`post-image-placeholder ${imageClass}`}></div>
                      </div>
                      <div className="post-content">
                        <div className="post-meta">
                          <span className="post-category">{recipe.category}</span>
                          <span className="post-date">{recipe.created_at}</span>
                        </div>
                        <h2 className="post-title">{recipe.title}</h2>
                        <p className="post-excerpt">{recipe.description}</p>
                        <div className="post-footer">
                          <div className="post-author">
                            <span className="author-name">{recipe.author.name}</span>
                            <span className="read-time">{recipe.prep_time} min prep</span>
                          </div>
                          <Link to="/recipes" className="read-more">
                            Leggi di Più →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : null}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && orderedPosts.length === 0 && recipes.length > 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h2>
                {selectedCategory 
                  ? `Nessuna ricetta trovata nella categoria "${selectedCategory}"`
                  : searchQuery 
                  ? `Nessun risultato per "${searchQuery}"`
                  : 'Nessuna ricetta trovata'}
              </h2>
              <p>
                {selectedCategory 
                  ? 'Prova a selezionare un\'altra categoria o rimuovi il filtro.'
                  : searchQuery
                  ? 'Prova con termini di ricerca diversi.'
                  : 'Non ci sono ricette disponibili al momento.'}
              </p>
              <div className="no-results-actions">
                {selectedCategory && (
                  <button 
                    className="btn-clear-filter"
                    onClick={() => setSelectedCategory('')}
                  >
                    Rimuovi Filtro Categoria
                  </button>
                )}
                {searchQuery && (
                  <button 
                    className="btn-clear-filter"
                    onClick={() => setSearchQuery('')}
                  >
                    Cancella Ricerca
                  </button>
                )}
                {!isAuthenticated && (
                  <Link to="/register" className="btn-subscribe">
                    Iscriviti per Pubblicare
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
