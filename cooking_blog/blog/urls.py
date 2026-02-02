from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'blog'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/me/', views.me, name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Recipe endpoints
    path('recipes/', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:pk>/like/', views.RecipeLikeView.as_view(), name='recipe-like'),
    path('recipes/<int:pk>/report/', views.RecipeReportView.as_view(), name='recipe-report'),
    path('recipes/my/', views.MyRecipesView.as_view(), name='my-recipes'),
    
    # Story endpoints
    path('stories/', views.StoryPostListView.as_view(), name='story-list'),
    path('stories/<int:pk>/', views.StoryPostDetailView.as_view(), name='story-detail'),
]