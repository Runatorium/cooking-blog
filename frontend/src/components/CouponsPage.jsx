import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CouponsPage.css';

// Placeholder offers – in future can come from API
const OFFERS = [
  { id: 1, store: 'Eataly', discount: '15% sul primo ordine', code: 'SARDEGNA15', description: 'Ingredienti e specialità italiane' },
  { id: 2, store: 'Tigrella', discount: '10% su utensili da cucina', code: 'CUCINA10', description: 'Pentole e accessori' },
  { id: 3, store: 'Cuciniamo', discount: 'Spedizione gratuita', code: 'GRATIS', description: 'Ordini oltre 49€' },
  { id: 4, store: 'Sapori Sardi', discount: '20% formaggi e bottarga', code: 'SAPORI20', description: 'Prodotti tipici sardi' },
  { id: 5, store: "Bio c'è", discount: '5% prodotti bio', code: 'BIO5', description: 'Alimentari biologici' },
  { id: 6, store: 'La Dispensa', discount: '12% pasta e riso', code: 'DISPENSA12', description: 'Prima materia e dispensa' },
];

const CouponsPage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="coupons-page">
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
            <Link to="/coupons" className="nav-link active">Offerte</Link>
            {isAuthenticated && (
              <>
                <span className="user-greeting">Benvenuto, {user?.name}!</span>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/publish" className="btn-publish">Pubblica una Ricetta</Link>
                <button onClick={logout} className="btn-subscribe">Esci</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="coupons-main">
        <div className="coupons-container">
          <header className="coupons-header">
            <h1>Offerte per te</h1>
            <p className="coupons-subtitle">Coupon e sconti dai nostri partner. Usa i codici al checkout.</p>
          </header>

          <section className="coupons-grid">
            {OFFERS.map((offer) => (
              <article key={offer.id} className="coupon-card">
                <div className="coupon-card-inner">
                  <span className="coupon-store">{offer.store}</span>
                  <p className="coupon-discount">{offer.discount}</p>
                  {offer.code && (
                    <div className="coupon-code-wrap">
                      <span className="coupon-code-label">Codice</span>
                      <code className="coupon-code">{offer.code}</code>
                    </div>
                  )}
                  {offer.description && (
                    <p className="coupon-desc">{offer.description}</p>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

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

export default CouponsPage;
