import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI, MEDIA_BASE_URL } from '../services/api';
import Footer from './Footer';
import SEO from './SEO';
import RecipeStructuredData from './RecipeStructuredData';
import ShareButton from './ShareButton';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liking, setLiking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate_content');
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeAPI.getRecipe(id);
      setRecipe(data);
    } catch (err) {
      setError('Impossibile caricare la ricetta. Riprova più tardi.');
      console.error('Error fetching recipe:', err);
    } finally {
      setLoading(false);
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

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLiking(true);
      const response = await recipeAPI.likeRecipe(id);
      setRecipe({
        ...recipe,
        is_liked: response.liked,
        likes_count: response.likes_count
      });
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert('Impossibile mettere like alla ricetta. Riprova più tardi.');
    } finally {
      setLiking(false);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reportReason) {
      alert('Seleziona un motivo per la segnalazione.');
      return;
    }

    try {
      setReporting(true);
      await recipeAPI.reportRecipe(id, reportReason, reportDescription);
      alert('Ricetta segnalata con successo. Grazie per il tuo feedback.');
      setShowReportModal(false);
      setReportReason('inappropriate_content');
      setReportDescription('');
    } catch (err) {
      console.error('Error reporting recipe:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Impossibile segnalare la ricetta. Riprova più tardi.';
      alert(errorMsg);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="loading-container">
          <div className="loading-spinner">Caricamento ricetta...</div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="error-container">
          <p>{error || 'Ricetta non trovata'}</p>
          <button onClick={() => navigate('/recipes')} className="btn-retry">
            Torna alle Ricette
          </button>
        </div>
      </div>
    );
  }

  const recipeImage = recipe.image 
    ? (recipe.image.startsWith('http') ? recipe.image : `${MEDIA_BASE_URL}${recipe.image}`)
    : null;
  
  const categoryDisplayName = getCategoryDisplayName(recipe.category);
  const keywords = [
    'ricette sarde',
    'cucina tradizionale sarda',
    categoryDisplayName.toLowerCase(),
    recipe.is_sardinian ? 'ricetta sarda' : '',
    recipe.gluten_free ? 'senza glutine' : '',
    recipe.lactose_free ? 'senza lattosio' : '',
  ].filter(k => k).join(', ');

  return (
    <div className="recipe-detail-page">
      <SEO
        title={recipe.title}
        description={`${recipe.description.substring(0, 100)}... Ricetta sarda. Prep: ${recipe.prep_time} min. Vedi ingredienti e istruzioni.`}
        keywords={keywords}
        image={recipeImage}
        type="article"
      />
      {recipe && <RecipeStructuredData recipe={recipe} />}
      {/* Main Content */}
      <main className="recipe-detail-main">
        <div className="recipe-detail-container">
          {/* Back Button */}
          <Link to="/recipes" className="back-link">
            ← Torna alle Ricette
          </Link>

          {/* Recipe Header */}
          <header className={`recipe-detail-header ${recipe.author?.is_redazione ? 'recipe-detail-header--redazione' : ''}`}>
            <div className="recipe-meta-top">
              {recipe.author?.is_redazione && <span className="redazione-badge">Redazione</span>}
              <span className="recipe-category">{getCategoryDisplayName(recipe.category)}</span>
              <span className="recipe-date">{formatDate(recipe.created_at)}</span>
            </div>
            <h1 className="recipe-title">{recipe.title}</h1>
            <p className="recipe-description">{recipe.description}</p>
            <div className="recipe-meta-bottom">
              <div className="recipe-author-info">
                <div className={`author-avatar-small ${recipe.author?.is_redazione ? 'author-avatar-small--redazione' : ''}`} title={recipe.author?.is_redazione ? 'Redazione' : undefined}>
                  {recipe.author?.is_redazione ? (
                    <span className="author-avatar-redazione-icon" aria-hidden>👨‍🍳</span>
                  ) : (
                    recipe.author?.display_name ? recipe.author.display_name.charAt(0).toUpperCase() : (recipe.author?.name ? recipe.author.name.charAt(0).toUpperCase() : 'U')
                  )}
                </div>
                <div>
                  <span className="author-name">{recipe.author?.display_name || recipe.author?.name || 'Autore Sconosciuto'}</span>
                  <span className="prep-time">🕐 {recipe.prep_time} minuti</span>
                </div>
              </div>
              {(recipe.gluten_free || recipe.lactose_free) && (
                <div className="dietary-badges">
                  {recipe.gluten_free && <span className="dietary-badge">🌾 Senza Glutine</span>}
                  {recipe.lactose_free && <span className="dietary-badge">🥛 Senza Lattosio</span>}
                </div>
              )}
            </div>
            <div className="recipe-actions-section">
              <button
                onClick={handleLike}
                className={`btn-like ${recipe.is_liked ? 'liked' : ''}`}
                disabled={liking || !isAuthenticated}
                title={!isAuthenticated ? 'Accedi per mettere like' : ''}
              >
                <span className="like-icon">{recipe.is_liked ? '❤️' : '🤍'}</span>
                <span className="like-count">{recipe.likes_count || 0}</span>
              </button>
              <ShareButton recipe={recipe} />
              {isAuthenticated && recipe.author?.id !== user?.id && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn-report"
                  title="Segnala contenuto inappropriato"
                >
                  🚩 Segnala
                </button>
              )}
            </div>
          </header>

          {/* Recipe Image */}
          <div className="recipe-image-section">
            {recipe.image ? (
              <img 
                src={recipe.image.startsWith('http') ? recipe.image : `${MEDIA_BASE_URL}${recipe.image}`}
                alt={`${recipe.title} - Ricetta sarda tradizionale`}
                className="recipe-main-image"
              />
            ) : (
              <div className={`recipe-image-placeholder ${getImageClass(recipe.category)}`}></div>
            )}
          </div>

          {/* Recipe Content */}
          <div className="recipe-content-grid">
            {/* Ingredients Section */}
            <section className="ingredients-section">
              <h2 className="section-title">Ingredienti</h2>
              <ul className="ingredients-list">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={ingredient.id || index} className="ingredient-item">
                      <span className="ingredient-bullet">•</span>
                      <span>{ingredient.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="ingredient-item">Nessun ingrediente disponibile</li>
                )}
              </ul>
            </section>

            {/* Instructions Section */}
            <section className="instructions-section">
              <h2 className="section-title">Istruzioni</h2>
              <ol className="instructions-list">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <li key={instruction.id || index} className="instruction-item">
                      <span className="instruction-number">{index + 1}</span>
                      <p>{instruction.step}</p>
                    </li>
                  ))
                ) : (
                  <li className="instruction-item">
                    <span className="instruction-number">1</span>
                    <p>Nessuna istruzione disponibile</p>
                  </li>
                )}
              </ol>
            </section>
          </div>

          {/* Final Author Comment */}
          {recipe.final_comment && recipe.final_comment.trim() && (
            <section className="final-comment-section">
              <h2 className="section-title">Commento finale dell'autore</h2>
              <p className="final-comment-body">{recipe.final_comment}</p>
            </section>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Segnala Ricetta</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Aiutaci a mantenere la comunità sicura segnalando contenuti inappropriati.</p>
              <div className="form-group">
                <label htmlFor="report-reason">Motivo della Segnalazione *</label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-select"
                >
                  <option value="inappropriate_content">Contenuto Inappropriato</option>
                  <option value="spam">Spam</option>
                  <option value="copyright">Violazione Copyright</option>
                  <option value="other">Altro</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="report-description">Descrizione (opzionale)</label>
                <textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows="4"
                  className="form-textarea"
                  placeholder="Fornisci maggiori dettagli sul problema..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={() => setShowReportModal(false)}>
                Annulla
              </button>
              <button className="btn-submit-modal" onClick={handleReport} disabled={reporting}>
                {reporting ? 'Invio...' : 'Invia Segnalazione'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RecipeDetail;
