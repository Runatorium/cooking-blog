import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchRecipes();
  }, [isAuthenticated, navigate]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeAPI.getMyRecipes();
      setRecipes(data.results || data || []);
    } catch (err) {
      setError('Impossibile caricare le tue ricette. Riprova più tardi.');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa ricetta?')) {
      return;
    }

    try {
      setDeletingId(id);
      await recipeAPI.deleteRecipe(id);
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (err) {
      alert('Impossibile eliminare la ricetta. Riprova più tardi.');
      console.error('Error deleting recipe:', err);
    } finally {
      setDeletingId(null);
    }
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              <span className="logo-icon">🍳</span>
              <span className="logo-text">Sardegna Ricette</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/recipes" className="nav-link">Ricette</Link>
              <Link to="/history" className="nav-link">Chi Siamo</Link>
              <Link to="/stories" className="nav-link">Storie</Link>
              {isAuthenticated && (
                <>
                  <span className="user-greeting">Benvenuto, {user?.name}!</span>
                  <Link to="/publish" className="btn-publish">Pubblica una Ricetta</Link>
                  <button onClick={logout} className="btn-subscribe">Esci</button>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner">Caricamento ricette...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Sardegna Ricette</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/recipes" className="nav-link">Ricette</Link>
            <Link to="/history" className="nav-link">Chi Siamo</Link>
            <Link to="/stories" className="nav-link">Storie</Link>
            {isAuthenticated && (
              <>
                <span className="user-greeting">Benvenuto, {user?.name}!</span>
                <Link to="/publish" className="btn-publish">Pubblica una Ricetta</Link>
                <button onClick={logout} className="btn-subscribe">Esci</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>La Tua Dashboard</h1>
            <p className="dashboard-subtitle">Gestisci le tue ricette tradizionali sarde</p>
            <Link to="/publish" className="btn-add-recipe">
              + Pubblica una Nuova Ricetta
            </Link>
          </div>

          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{recipes.length}</div>
              <div className="stat-label">Ricette Totali</div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchRecipes} className="btn-retry">
                Riprova
              </button>
            </div>
          )}

          {/* No Recipes State */}
          {!error && recipes.length === 0 && (
            <div className="no-recipes">
              <div className="no-recipes-icon">🍝</div>
              <h2>Nessuna Ricetta Ancora</h2>
              <p>Inizia a condividere le tue ricette tradizionali sarde con la comunità!</p>
              <Link to="/publish" className="btn-add-recipe-primary">
                + Pubblica la Prima Ricetta
              </Link>
            </div>
          )}

          {/* Recipes Grid */}
          {!error && recipes.length > 0 && (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card-dashboard">
                  <div className="recipe-card-image-wrapper">
                    {recipe.image ? (
                      <img
                        src={recipe.image.startsWith('http') ? recipe.image : `http://localhost:8000${recipe.image}`}
                        alt={recipe.title}
                        className="recipe-card-img"
                      />
                    ) : (
                      <div className={`recipe-image-placeholder ${getImageClass(recipe.category)}`}></div>
                    )}
                    {!recipe.is_published && (
                      <div className="draft-badge">Bozza</div>
                    )}
                  </div>
                  <div className="recipe-card-content">
                    <div className="recipe-card-header">
                      <h3 className="recipe-card-title">{recipe.title}</h3>
                      <span className="recipe-category-badge">{getCategoryDisplayName(recipe.category)}</span>
                    </div>
                    <p className="recipe-card-description">{recipe.description}</p>
                    <div className="recipe-meta">
                      <span className="prep-time-small">🕐 {recipe.prep_time} min</span>
                      {(recipe.gluten_free || recipe.lactose_free) && (
                        <div className="dietary-badges-small">
                          {recipe.gluten_free && <span className="dietary-badge-small">🌾</span>}
                          {recipe.lactose_free && <span className="dietary-badge-small">🥛</span>}
                        </div>
                      )}
                    </div>
                    <div className="recipe-actions">
                      <Link to={`/recipe/${recipe.id}`} className="btn-view">
                        Visualizza
                      </Link>
                      <Link to={`/edit-recipe/${recipe.id}`} className="btn-edit">
                        Modifica
                      </Link>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="btn-delete"
                        disabled={deletingId === recipe.id}
                      >
                        {deletingId === recipe.id ? 'Eliminazione...' : 'Elimina'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

export default Dashboard;
