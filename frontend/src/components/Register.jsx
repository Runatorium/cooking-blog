import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Le password non corrispondono');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.name,
      formData.password,
      formData.password2
    );

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registrazione fallita. Riprova.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container login-page">
      <div className="auth-background-overlay"></div>
      <div className="auth-card login-card">
        <div className="auth-header">
          <div className="logo-small">
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Sardegna Ricette</span>
          </div>
          <h1>Registrati</h1>
          <p>Unisciti a Sardegna Ricette e inizia a condividere le tue ricette tradizionali sarde</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Il tuo nome"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="la-tua@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2">Conferma Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-full btn-primary" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Hai già un account? <Link to="/login">Accedi</Link></p>
          <Link to="/" className="back-link">← Torna alla Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
