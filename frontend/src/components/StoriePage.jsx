import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyAPI } from '../services/api';
import Footer from './Footer';
import SEO from './SEO';
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

  // Format story content: convert markdown to HTML
  const formatStoryContent = (content) => {
    if (!content) return '';
    
    // Split by double line breaks to create paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((para, idx) => {
      let formatted = para.trim();
      
      // Check if paragraph contains bullet points (lines starting with •)
      const lines = formatted.split('\n').map(l => l.trim()).filter(l => l);
      const hasBullets = lines.some(line => line.startsWith('•'));
      
      if (hasBullets) {
        // Handle bullet list
        const bulletItems = lines
          .filter(line => line.startsWith('•'))
          .map(line => {
            let item = line.replace(/^•\s*/, '');
            // Convert **bold** to <strong>
            item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `<div class="story-bullet-point">${item}</div>`;
          });
        return bulletItems.join('');
      }
      
      // Regular paragraph: convert **bold** to <strong>
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Replace single line breaks with spaces for regular paragraphs
      formatted = formatted.replace(/\n/g, ' ');
      
      return `<p>${formatted}</p>`;
    }).join('');
  };

  return (
    <div className="storie-page">
      <SEO
        title="Le Nostre Storie - Sardegna Ricette e non solo"
        description="Scopri le storie delle persone dietro le ricette: chef, cuochi casalinghi e appassionati che condividono la loro passione per la cucina tradizionale sarda."
        keywords="storie cucina sarda, chef sardi, tradizioni culinarie sarde, storie ricette"
      />
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
                  <div className="story-content">
                    <div className="story-header">
                      <div className="story-author-info">
                        <div className="story-avatar">
                          {story.author?.is_redazione ? '👨‍🍳' : (story.author?.name ? story.author.name.charAt(0).toUpperCase() : '👨‍🍳')}
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
                    <div 
                      className="story-text"
                      dangerouslySetInnerHTML={{ __html: formatStoryContent(story.content) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StoriePage;
