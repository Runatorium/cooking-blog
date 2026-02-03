import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './components/HomePage'
import BlogPage from './components/BlogPage'
import RecipeDetail from './components/RecipeDetail'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import PrivacyPage from './components/PrivacyPage'
import TermsPage from './components/TermsPage'
import StoriePage from './components/StoriePage'
import PublishRecipe from './components/PublishRecipe'
import EditRecipe from './components/EditRecipe'
import CouponsPage from './components/CouponsPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recipes" element={<BlogPage />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/stories" element={<StoriePage />} />
      <Route
        path="/publish"
        element={
          <ProtectedRoute>
            <PublishRecipe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-recipe/:id"
        element={
          <ProtectedRoute>
            <EditRecipe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <ProtectedRoute>
            <CouponsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
      </main>
    </>
  )
}

export default App
