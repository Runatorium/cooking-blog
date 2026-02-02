import { useAuth } from '../contexts/AuthContext';
import LandingPage from './LandingPage';

const HomePage = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
        <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#faf8f5'
      }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  return <LandingPage />;
};

export default HomePage;