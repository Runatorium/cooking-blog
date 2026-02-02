import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyAPI } from '../services/api';
import './StoriePage.css';

const StoriePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await storyAPI.getStories();
      setStories(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('Impossibile caricare le storie. Riprova più tardi.');
      console.error('Error fetching stories:', err);
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

  return (
    <div className="storie-page">
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
            <Link to="/stories" className="nav-link active">Storie</Link>
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

      {/* Hero Section */}
      <section className="storie-hero">
        <div className="container">
          <h1 className="hero-title">Le Nostre Storie</h1>
          <p className="hero-description">
            Scopri le storie delle persone dietro le ricette: chef, cuochi casalinghi e appassionati che condividono la loro passione per la cucina tradizionale sarda.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="storie-main">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">Caricamento storie...</div>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchStories} className="btn-retry">
                Riprova
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="stories-grid">
              <div className="story-card">
                <div className="story-image">
                  <div className="story-image-placeholder">
                    <div className="story-avatar-large">👨‍🍳</div>
                  </div>
                </div>
                <div className="story-content">
                  <div className="story-header">
                    <div className="story-author-info">
                      <div className="story-avatar">👨‍🍳</div>
                      <div className="story-author-details">
                        <h3 className="story-title">Nessuna Storia Ancora</h3>
                        <div className="story-meta">
                          <span className="story-author-name">Sardegna Ricette</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="story-text">
                    <p>Presto condivideremo le storie dei nostri chef e appassionati di cucina tradizionale sarda. Torna presto per scoprire le loro storie!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="stories-grid">
              {stories.map((story) => (
                <div key={story.id} className="story-card">
                  <div className="story-image">
                    {story.image ? (
                      <img
                        src={story.image.startsWith('http') ? story.image : `http://localhost:8000${story.image}`}
                        alt={story.title}
                        className="story-image-img"
                      />
                    ) : (
                      <div className="story-image-placeholder">
                        <div className="story-avatar-large">
                          {story.author?.name ? story.author.name.charAt(0).toUpperCase() : '👨‍🍳'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="story-content">
                    <div className="story-header">
                      <div className="story-author-info">
                        <div className="story-avatar">
                          {story.author?.name ? story.author.name.charAt(0).toUpperCase() : '👨‍🍳'}
                        </div>
                        <div className="story-author-details">
                          <h3 className="story-title">{story.title}</h3>
                          <div className="story-meta">
                            <span className="story-author-name">{story.author?.name || 'Autore Sconosciuto'}</span>
                            {story.role && (
                              <>
                                <span className="story-separator">•</span>
                                <span className="story-role">{story.role}</span>
                              </>
                            )}
                            <span className="story-separator">•</span>
                            <span className="story-date">{formatDate(story.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="story-text">
                      <p>{story.content}</p>
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

export default StoriePage;
