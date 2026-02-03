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
    path('recipes/category_counts/', views.recipe_category_counts, name='recipe-category-counts'),
    path('recipes/my/', views.MyRecipesView.as_view(), name='my-recipes'),
    path('recipes/<str:slug_or_id>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<str:slug_or_id>/like/', views.RecipeLikeView.as_view(), name='recipe-like'),
    path('recipes/<str:slug_or_id>/report/', views.RecipeReportView.as_view(), name='recipe-report'),
    
    # Story endpoints
    path('stories/', views.StoryPostListView.as_view(), name='story-list'),
    path('stories/<int:pk>/', views.StoryPostDetailView.as_view(), name='story-detail'),
]