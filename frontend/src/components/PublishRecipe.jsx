import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import Footer from './Footer';
import './PublishRecipe.css';

const PublishRecipe = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prepTime: '',
    glutenFree: false,
    lactoseFree: false,
    isSardinian: false,
    finalComment: '',
    ingredients: [''],
    instructions: [''],
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState('');

  const categories = [
    { value: 'Bread & Pizza', label: 'Pane & Pizza', icon: '🍞' },
    { value: 'Pasta Dishes', label: 'Primi Piatti', icon: '🍝' },
    { value: 'Meat & Poultry', label: 'Carne & Pollame', icon: '🍗' },
    { value: 'Desserts', label: 'Dolci', icon: '🍰' },
    { value: 'Fish', label: 'Pesce', icon: '🐟' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleCategorySelect = (categoryValue) => {
    setFormData({
      ...formData,
      category: categoryValue,
    });
    setError('');
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ''],
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        ingredients: newIngredients,
      });
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({
      ...formData,
      instructions: newInstructions,
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ''],
    });
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        instructions: newInstructions,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError(`L'immagine è troppo grande. La dimensione massima consentita è 5MB. Dimensione attuale: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError('Il file deve essere un\'immagine');
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    setImageError('');
    setFormData({
      ...formData,
      image: file,
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    if (!formData.description.trim()) {
      setError('La descrizione è obbligatoria');
      return;
    }
    if (!formData.category) {
      setError('Seleziona una categoria');
      return;
    }
    if (!formData.prepTime || parseInt(formData.prepTime) <= 0) {
      setError('Il tempo di preparazione deve essere un numero positivo');
      return;
    }
    if (formData.ingredients.filter(i => i.trim()).length === 0) {
      setError('Aggiungi almeno un ingrediente');
      return;
    }
    if (formData.instructions.filter(i => i.trim()).length === 0) {
      setError('Aggiungi almeno un\'istruzione');
      return;
    }

    try {
      setSubmitting(true);
      await recipeAPI.createRecipe(formData);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Impossibile pubblicare la ricetta. Riprova più tardi.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="publish-recipe-page">
      {/* Main Content */}
      <main className="publish-main">
        <div className="publish-container">
          <div className="publish-header">
            <h1>Pubblica una Ricetta</h1>
            <p>Condividi la tua ricetta tradizionale sarda con la comunità</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="publish-form">
            {/* Basic Information */}
            <div className="form-section">
              <h2 className="section-title">Informazioni Base</h2>
              
              <div className="form-group">
                <label htmlFor="title">Titolo della Ricetta *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Es: Culurgiones Sardi"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrizione *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Descrivi la ricetta..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Categoria *</label>
                <div className="category-cards-grid">
                  {categories.map((cat) => (
                    <div
                      key={cat.value}
                      className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.value)}
                    >
                      <div className="category-icon">{cat.icon}</div>
                      <div className="category-label">{cat.label}</div>
                    </div>
                  ))}
                </div>
                {!formData.category && <span className="category-error">Seleziona una categoria</span>}
              </div>

              <div className="form-group">
                <label htmlFor="prepTime">Tempo di Preparazione (minuti) *</label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Recipe Origin */}
            <div className="form-section">
              <h2 className="section-title">Origine della Ricetta</h2>
              <div className="dietary-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isSardinian"
                    checked={formData.isSardinian}
                    onChange={handleChange}
                  />
                  <span className="checkbox-icon">🏝️</span>
                  <span className="checkbox-text">Ricetta Sarda</span>
                </label>
              </div>
            </div>

            {/* Dietary Options */}
            <div className="form-section">
              <h2 className="section-title">Caratteristiche Dietetiche</h2>
              <div className="dietary-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="glutenFree"
                    checked={formData.glutenFree}
                    onChange={handleChange}
                  />
                  <span className="checkbox-icon">🌾</span>
                  <span className="checkbox-text">Senza Glutine</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="lactoseFree"
                    checked={formData.lactoseFree}
                    onChange={handleChange}
                  />
                  <span className="checkbox-icon">🥛</span>
                  <span className="checkbox-text">Senza Lattosio</span>
                </label>
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-section">
              <div className="section-header-row">
                <h2 className="section-title">Ingredienti *</h2>
                <button type="button" onClick={addIngredient} className="btn-add">
                  + Aggiungi Ingrediente
                </button>
              </div>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    className="ingredient-input"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingrediente ${index + 1}`}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="btn-remove"
                      title="Rimuovi ingrediente"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="form-section">
              <div className="section-header-row">
                <h2 className="section-title">Istruzioni *</h2>
                <button type="button" onClick={addInstruction} className="btn-add">
                  + Aggiungi Istruzione
                </button>
              </div>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="instruction-row">
                  <div className="step-number">{index + 1}</div>
                  <textarea
                    className="instruction-input"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Passo ${index + 1}`}
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="btn-remove"
                      title="Rimuovi istruzione"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Image Upload */}
            <div className="form-section">
              <h2 className="section-title">Immagine della Ricetta</h2>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                <label htmlFor="image" className="image-upload-label">
                  <div className="image-upload-box">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="image-upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Clicca per caricare un'immagine</span>
                        <span className="upload-hint">Max 5MB</span>
                      </div>
                    )}
                  </div>
                </label>
                {imageError && <div className="error-message">{imageError}</div>}
              </div>
            </div>

            {/* Final Author Comment */}
            <div className="form-section">
              <h2 className="section-title">Commento finale dell'autore (opzionale)</h2>
              <div className="form-group">
                <label htmlFor="finalComment">Commenti finali dell'autore</label>
                <textarea
                  id="finalComment"
                  name="finalComment"
                  value={formData.finalComment}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Un breve pensiero personale, un consiglio, un ricordo legato a questa ricetta..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Pubblicazione in corso...' : 'Pubblica Ricetta'}
              </button>
              <Link to="/dashboard" className="btn-cancel">
                Annulla
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublishRecipe;
