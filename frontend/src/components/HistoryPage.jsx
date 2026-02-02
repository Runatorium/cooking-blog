import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HistoryPage.css';

const HistoryPage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="history-page">
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
            <Link to="/history" className="nav-link active">Chi Siamo</Link>
            <Link to="/stories" className="nav-link">Storie</Link>
            {isAuthenticated ? (
              <>
                <span className="user-greeting">Benvenuto, {user?.name}!</span>
                <Link to="/coupons" className="nav-link">Offerte</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
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
      <section className="history-hero">
        <div className="container">
          <h1 className="history-title">La Nostra Storia</h1>
          <p className="history-subtitle">Tradizioni culinarie autentiche dal cuore della Sardegna</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="history-content">
        <div className="container">
          {/* Story Section */}
          <section className="history-story-section">
            <div className="story-image-wrapper">
              <div className="story-image-placeholder"></div>
            </div>
            <div className="story-text-content">
              <span className="story-label">La Nostra Tradizione</span>
              <h2>Ricette Autentiche Passate di Generazione in Generazione</h2>
              <p>
                Sardegna Ricette nasce dalla passione per preservare e condividere le ricette tradizionali sarde che sono state tramandate nelle nostre famiglie per generazioni. Ogni ricetta racconta una storia, ogni ingrediente porta con sé il sapore della nostra terra.
              </p>
              <p>
                La nostra missione è mantenere vive queste tradizioni culinarie autentiche, permettendo a tutti di scoprire e gustare i sapori unici della Sardegna. Dalle ricette più semplici a quelle più elaborate, ogni piatto rappresenta un pezzo della nostra cultura e della nostra identità.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="values-section">
            <h2 className="section-heading">Cosa Crediamo</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🌾</div>
                <h3>Autenticità</h3>
                <p>Rispettiamo le ricette originali e i metodi tradizionali di preparazione, mantenendo intatta l'essenza della cucina sarda.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">👨‍👩‍👧‍👦</div>
                <h3>Comunità</h3>
                <p>Crediamo nel potere della condivisione e nella creazione di una comunità che valorizza le tradizioni culinarie locali.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3>Passione</h3>
                <p>Ogni ricetta è preparata con amore e dedizione, proprio come nelle cucine delle nostre nonne.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌍</div>
                <h3>Sostenibilità</h3>
                <p>Promuoviamo l'uso di ingredienti locali e stagionali, rispettando l'ambiente e supportando i produttori sardi.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="history-cta">
            <h2>Unisciti alla Nostra Comunità</h2>
            <p>Condividi le tue ricette tradizionali sarde e scopri quelle degli altri</p>
            <div className="cta-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-primary">Registrati</Link>
                  <Link to="/recipes" className="btn-outline">Esplora le Ricette</Link>
                </>
              ) : (
                <Link to="/publish" className="btn-primary">Pubblica una Ricetta</Link>
              )}
            </div>
          </section>
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
                <Link to="/contact">Contattaci</Link>
              </div>
              <div className="footer-column">
                <h4>Seguici</h4>
                <div className="social-icons">
                  <a href="#" aria-label="Facebook">f</a>
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

export default HistoryPage;
