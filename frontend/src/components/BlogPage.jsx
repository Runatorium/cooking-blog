import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import './BlogPage.css';

const BlogPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likingIds, setLikingIds] = useState(new Set());

  // Map Italian category names to backend category values
  const categoryMap = {
    'Pane & Pizza': 'Bread & Pizza',
    'Primi Piatti': 'Pasta Dishes',
    'Carne & Pollame': 'Meat & Poultry',
    'Dolci': 'Desserts',
    'Pesce': 'Fish',
  };

  // Reverse map for display
  const reverseCategoryMap = {
    'Bread & Pizza': 'Pane & Pizza',
    'Pasta Dishes': 'Primi Piatti',
    'Meat & Poultry': 'Carne & Pollame',
    'Desserts': 'Dolci',
    'Fish': 'Pesce',
  };

  const fetchRecipes = async (search = '', category = '') => {
    try {
      setLoading(true);
      setError('');
      const backendCategory = category ? categoryMap[category] || category : '';
      const data = await recipeAPI.getRecipes(search, backendCategory);
      setRecipes(data.results || data); // Handle both paginated and non-paginated responses
    } catch (err) {
      setError('Impossibile caricare le ricette. Riprova più tardi.');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchRecipes('', '');
  }, []);

  useEffect(() => {
    // Fetch recipes when category changes
    fetchRecipes(searchQuery, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    // Debounce search query
    const timeoutId = setTimeout(() => {
      fetchRecipes(searchQuery, selectedCategory);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  // Count recipes by category
  const getCategoryCount = (category) => {
    const backendCategory = categoryMap[category];
    if (recipes.length === 0) {
      // Return placeholder counts when no recipes
      const placeholderCounts = {
        'Pane & Pizza': 24,
        'Primi Piatti': 38,
        'Carne & Pollame': 31,
        'Dolci': 27,
        'Pesce': 19,
      };
      return placeholderCounts[category] || 0;
    }
    return recipes.filter(r => r.category === backendCategory).length;
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
        (recipe.author?.name && recipe.author.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [recipes, selectedCategory, searchQuery]);

  return (
    <div className="blog-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Sardegna Ricette</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/recipes" className="nav-link active">Ricette</Link>
            <Link to="/history" className="nav-link">Chi Siamo</Link>
            <Link to="/stories" className="nav-link">Storie</Link>
            {isAuthenticated ? (
              <>
                <span className="user-greeting">Benvenuto, {user?.name}!</span>
                <Link to="/publish" className="btn-publish">Pubblica una Ricetta</Link>
                <button onClick={logout} className="btn-subscribe">Esci</button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Accedi</Link>
                <Link to="/register" className="btn-subscribe">Iscriviti</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

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
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Cerca ricette, ingredienti, autori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Cancella ricerca"
                >
                  ×
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-info">
                {filteredPosts.length} risultato{filteredPosts.length !== 1 ? 'i' : ''} trovato{filteredPosts.length !== 1 ? 'i' : ''} per "{searchQuery}"
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
              <button onClick={() => fetchRecipes(searchQuery, selectedCategory)} className="btn-retry">Riprova</button>
            </div>
          )}

          {/* Blog Posts Grid */}
          {!loading && !error && (filteredPosts.length > 0 || recipes.length === 0) && (
            <div className="blog-posts">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((recipe) => (
                  <article key={recipe.id} className="blog-post-card">
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
                        <span className="post-category">{reverseCategoryMap[recipe.category] || recipe.category}</span>
                        <span className="post-date">{formatDate(recipe.created_at)}</span>
                      </div>
                      <h2 className="post-title">{recipe.title}</h2>
                      <p className="post-excerpt">{recipe.description}</p>
                      <div className="post-footer">
                        <div className="post-author">
                          <span className="author-name">{recipe.author?.name || 'Unknown'}</span>
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
                          <Link to={`/recipe/${recipe.id}`} className="read-more">
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
          {!loading && !error && filteredPosts.length === 0 && recipes.length > 0 && (
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>🍳 Sardegna Ricette</h3>
              <p>Condividiamo ricette tradizionali autentiche e tradizioni culinarie dal cuore della Sardegna.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Ricette</h4>
                <Link to="/recipes/pasta">Pasta & Risotto</Link>
                <Link to="/recipes/bread">Pane & Pizza</Link>
                <Link to="/recipes/soup">Zuppe & Stufati</Link>
                <Link to="/recipes/dessert">Dolci</Link>
              </div>
              <div className="footer-column">
                <h4>Chi Siamo</h4>
                <Link to="/history">La Nostra Storia</Link>
                <Link to="/about/family">Conosci la Famiglia</Link>
                <Link to="/contact">Contattaci</Link>
                <Link to="/classes">Corsi di Cucina</Link>
              </div>
              <div className="footer-column">
                <h4>Seguici</h4>
                <div className="social-icons">
                  <a href="#" aria-label="Facebook">f</a>
                  <a href="#" aria-label="Instagram">📷</a>
                  <a href="#" aria-label="Pinterest">📌</a>
                  <a href="#" aria-label="YouTube">▶️</a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 Sardegna Ricette. Tutti i diritti riservati.</p>
            <div className="footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Termini di Servizio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
