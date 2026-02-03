import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🍳 Sardegna Ricette</h3>
            <p>Condividiamo ricette tradizionali autentiche e tradizioni culinarie dal cuore della Sardegna.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4><Link to="/recipes" className="footer-heading-link">Ricette</Link></h4>
              <Link to="/recipes?category=Primi Piatti">Primi Piatti</Link>
              <Link to="/recipes?category=Pane & Pizza">Pane & Pizza</Link>
              <Link to="/recipes?category=Carne & Pollame">Carne & Pollame</Link>
              <Link to="/recipes?category=Dolci">Dolci</Link>
              <Link to="/recipes?category=Pesce">Pesce</Link>
            </div>
            <div className="footer-column">
              <h4>Seguici</h4>
              <div className="social-icons">
                <a href="https://www.facebook.com/groups/264218916966891?locale=it_IT" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
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
  );
};

export default Footer;
