import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import Footer from './Footer';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmRecipe, setDeleteConfirmRecipe] = useState(null);

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

  const handleDeleteClick = (recipe) => {
    setDeleteConfirmRecipe({ id: recipe.id, title: recipe.title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmRecipe) return;
    const { id } = deleteConfirmRecipe;
    try {
      setDeletingId(id);
      setDeleteConfirmRecipe(null);
      await recipeAPI.deleteRecipe(id);
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (err) {
      alert('Impossibile eliminare la ricetta. Riprova più tardi.');
      console.error('Error deleting recipe:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmRecipe(null);
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
              <Link to="/stories" className="nav-link">Storie</Link>
            {isAuthenticated && (
              <>
                <span className="user-greeting">Benvenuto, {user?.name}!</span>
                <Link to="/coupons" className="nav-link">Offerte</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
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
                      <Link to={`/recipe/${recipe.slug || recipe.id}`} className="btn-view">
                        Visualizza
                      </Link>
                      <Link to={`/edit-recipe/${recipe.id}`} className="btn-edit">
                        Modifica
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(recipe)}
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

      {/* Delete confirmation modal */}
      {deleteConfirmRecipe && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>Elimina ricetta</h2>
              <button type="button" className="delete-modal-close" onClick={handleDeleteCancel} aria-label="Chiudi">×</button>
            </div>
            <div className="delete-modal-body">
              <p>Sei sicuro di voler eliminare questa ricetta?</p>
              <p className="delete-modal-recipe-title">«{deleteConfirmRecipe.title}»</p>
              <p className="delete-modal-warning">L'operazione non può essere annullata.</p>
            </div>
            <div className="delete-modal-footer">
              <button type="button" className="btn-delete-cancel" onClick={handleDeleteCancel}>
                Annulla
              </button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteConfirm}>
                Sì, elimina
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
