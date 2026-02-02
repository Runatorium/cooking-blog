import { Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import BlogPage from './components/BlogPage'
import RecipeDetail from './components/RecipeDetail'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import HistoryPage from './components/HistoryPage'
import StoriePage from './components/StoriePage'
import PublishRecipe from './components/PublishRecipe'
import EditRecipe from './components/EditRecipe'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recipes" element={<BlogPage />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/history" element={<HistoryPage />} />
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
    </Routes>
  )
}

export default App
