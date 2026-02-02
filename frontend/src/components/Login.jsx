import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Accesso fallito. Riprova.');
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
          <h1>Accedi</h1>
          <p>Bentornato! Accedi al tuo account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            />
          </div>

          <button type="submit" className="btn-full btn-primary" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Non hai un account? <Link to="/register">Registrati</Link></p>
          <Link to="/" className="back-link">← Torna alla Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
