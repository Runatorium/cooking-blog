import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo-section">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">🍳</span>
            <span className="logo-text">
              Sardegna Ricette<span className="logo-subtitle"> e non solo</span>
            </span>
          </Link>
          {isAuthenticated && (
            <span className="user-greeting">Benvenuto, {user?.name}!</span>
          )}
        </div>
        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/recipes" className={`nav-link ${isActive('/recipes') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Ricette</Link>
          <Link to="/stories" className={`nav-link ${isActive('/stories') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Storie</Link>
          {isAuthenticated ? (
            <>
              <Link to="/coupons" className={`nav-link ${isActive('/coupons') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Offerte</Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/publish" className="btn-publish" onClick={() => setMenuOpen(false)}>
                <span className="btn-publish-text-full">Pubblica una Ricetta</span>
                <span className="btn-publish-text-mobile">Pubblica</span>
              </Link>
              <button type="button" onClick={() => { setMenuOpen(false); logout(); }} className="btn-subscribe">Esci</button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Accedi</Link>
              <Link to="/register" className="btn-subscribe" onClick={() => setMenuOpen(false)}>Iscriviti</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
