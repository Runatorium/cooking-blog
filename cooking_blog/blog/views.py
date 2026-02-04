from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
import logging
from .serializers import (
    UserRegistrationSerializer, UserSerializer,
    RecipeSerializer, RecipeCreateSerializer, RecipeUpdateSerializer,
    StoryPostSerializer, RecipeReportSerializer
)
from .models import User, Recipe, StoryPost, RecipeLike, RecipeReport

logger = logging.getLogger(__name__)


def get_recipe_by_slug_or_id(slug_or_id, queryset=None):
    """Resolve a recipe by numeric id or by slug. Raises Http404 if not found."""
    if queryset is None:
        queryset = Recipe.objects.all()
    if slug_or_id.isdigit():
        return get_object_or_404(queryset, pk=int(slug_or_id))
    return get_object_or_404(queryset, slug=slug_or_id)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint."""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint."""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=email, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'User account is disabled'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'message': 'Login successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user details."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_category_counts(request):
    """Return recipe count per category (unfiltered: published, not flagged). Used for category cards so counts don't change when user applies filters."""
    queryset = Recipe.objects.filter(is_published=True).annotate(
        report_count=Count('recipe_reports')
    ).filter(report_count__lte=5).values('category').annotate(count=Count('id'))
    counts = {row['category']: row['count'] for row in queryset}
    return Response(counts, status=status.HTTP_200_OK)


class RecipeListCreateView(generics.ListCreateAPIView):
    """List all recipes or create a new recipe."""
    queryset = Recipe.objects.filter(is_published=True).select_related('author').prefetch_related('ingredients', 'instructions')
    permission_classes = [AllowAny]  # Allow anyone to view, but creation requires auth
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateSerializer
        return RecipeSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        queryset = Recipe.objects.filter(is_published=True).select_related('author').prefetch_related('ingredients', 'instructions', 'recipe_likes', 'recipe_reports')
        
        # Exclude recipes with more than 5 reports (flagged recipes)
        queryset = queryset.annotate(
            report_count=Count('recipe_reports')
        ).exclude(report_count__gt=5)
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(author__name__icontains=search_query)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Gluten-free filter
        gluten_free = self.request.query_params.get('gluten_free', None)
        if gluten_free is not None:
            gluten_free_bool = gluten_free.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(gluten_free=gluten_free_bool)
        
        # Lactose-free filter
        lactose_free = self.request.query_params.get('lactose_free', None)
        if lactose_free is not None:
            lactose_free_bool = lactose_free.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(lactose_free=lactose_free_bool)
        
        # Sardinian filter
        is_sardinian = self.request.query_params.get('is_sardinian', None)
        if is_sardinian is not None:
            sardinian_bool = is_sardinian.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_sardinian=sardinian_bool)
        
        # Redazione-only: only recipes from Redazione (editorial) account
        redazione_only = self.request.query_params.get('redazione_only', None)
        if redazione_only is not None and redazione_only.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(author__is_redazione=True)
        
        # Order by: most liked (order_by=likes or order_by=most_liked)
        order_by = (self.request.query_params.get('order_by') or '').strip().lower()
        if order_by in ('likes', 'most_liked'):
            queryset = queryset.annotate(likes_count_ord=Count('recipe_likes'))
            return queryset.order_by('-is_featured', '-likes_count_ord', '-created_at')
        
        return queryset.order_by('-is_featured', '-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Author is set in the serializer's create() method from request.user
        # No need to pass it here to avoid "multiple values for keyword argument" error
        serializer.save()


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a single recipe. URL accepts id or slug."""
    queryset = Recipe.objects.select_related('author').prefetch_related('ingredients', 'instructions')
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'slug_or_id'

    def get_object(self):
        slug_or_id = self.kwargs.get('slug_or_id')
        queryset = self.get_queryset()
        return get_recipe_by_slug_or_id(slug_or_id, queryset=queryset)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeUpdateSerializer
        return RecipeSerializer

    def get_queryset(self):
        # For GET requests, show published recipes to anyone (excluding flagged recipes)
        # For PUT/PATCH/DELETE, show all recipes but check ownership in permissions
        if self.request.method == 'GET':
            queryset = Recipe.objects.filter(is_published=True).select_related('author').prefetch_related('ingredients', 'instructions', 'recipe_likes', 'recipe_reports')
            # Exclude recipes with more than 5 reports
            queryset = queryset.annotate(
                report_count=Count('recipe_reports')
            ).exclude(report_count__gt=5)
            return queryset
        return Recipe.objects.select_related('author').prefetch_related('ingredients', 'instructions', 'recipe_likes', 'recipe_reports')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_update(self, serializer):
        # Check if user owns the recipe
        recipe = self.get_object()
        if recipe.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di modificare questa ricetta.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Check if user owns the recipe
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di eliminare questa ricetta.")
        instance.delete()


class MyRecipesView(generics.ListAPIView):
    """List all recipes created by the authenticated user."""
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(author=self.request.user).select_related('author').prefetch_related('ingredients', 'instructions', 'recipe_likes', 'recipe_reports').order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class RecipeReportView(generics.CreateAPIView):
    """Report a recipe for inappropriate content. URL accepts id or slug."""
    serializer_class = RecipeReportSerializer
    permission_classes = [IsAuthenticated]
    queryset = Recipe.objects.all()

    def get_object(self):
        slug_or_id = self.kwargs.get('slug_or_id')
        return get_recipe_by_slug_or_id(slug_or_id, queryset=self.get_queryset())

    def perform_create(self, serializer):
        recipe = self.get_object()
        user = self.request.user
        
        # Check if user already reported this recipe
        if RecipeReport.objects.filter(user=user, recipe=recipe).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "Hai già segnalato questa ricetta."})
        
        # Check if user is trying to report their own recipe
        if recipe.author == user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "Non puoi segnalare la tua stessa ricetta."})
        
        # Save the report with user and recipe
        serializer.save(user=user, recipe=recipe)
        
        # Check if recipe should be flagged (more than 5 reports)
        report_count = recipe.recipe_reports.count()
        if report_count > 5:
            # Recipe is now flagged and will be hidden from public view
            pass


class RecipeLikeView(generics.GenericAPIView):
    """Toggle like on a recipe. URL accepts id or slug."""
    queryset = Recipe.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        slug_or_id = self.kwargs.get('slug_or_id')
        return get_recipe_by_slug_or_id(slug_or_id, queryset=self.get_queryset())

    def post(self, request, slug_or_id):
        """Add or remove a like from a recipe."""
        recipe = self.get_object()
        user = request.user
        
        # Check if user already liked this recipe
        like, created = RecipeLike.objects.get_or_create(
            user=user,
            recipe=recipe
        )
        
        if not created:
            # User already liked, so remove the like
            like.delete()
            liked = False
        else:
            # User just liked the recipe
            liked = True
        
        # Return updated like count
        likes_count = recipe.recipe_likes.count()
        
        return Response({
            'liked': liked,
            'likes_count': likes_count
        }, status=status.HTTP_200_OK)


class StoryPostListView(generics.ListAPIView):
    """List all published story posts."""
    queryset = StoryPost.objects.filter(is_published=True).select_related('author')
    serializer_class = StoryPostSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = StoryPost.objects.filter(is_published=True).select_related('author')
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(content__icontains=search_query) |
                Q(role__icontains=search_query) |
                Q(author__name__icontains=search_query)
            )
        
        return queryset.order_by('-created_at')


class StoryPostDetailView(generics.RetrieveAPIView):
    """Retrieve a single story post."""
    queryset = StoryPost.objects.filter(is_published=True).select_related('author')
    serializer_class = StoryPostSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([AllowAny])
def sitemap(request):
    """Generate XML sitemap for SEO."""
    from django.http import HttpResponse
    from django.utils import timezone
    from datetime import timedelta
    
    base_url = request.build_absolute_uri('/').rstrip('/')
    
    # Get all published recipes
    recipes = Recipe.objects.filter(is_published=True).order_by('-updated_at')
    
    # Get all published stories
    stories = StoryPost.objects.filter(is_published=True).order_by('-updated_at')
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Homepage
    xml.append('  <url>')
    xml.append(f'    <loc>{base_url}/</loc>')
    xml.append('    <changefreq>daily</changefreq>')
    xml.append('    <priority>1.0</priority>')
    xml.append('  </url>')
    
    # Recipes page
    xml.append('  <url>')
    xml.append(f'    <loc>{base_url}/recipes</loc>')
    xml.append('    <changefreq>daily</changefreq>')
    xml.append('    <priority>0.9</priority>')
    xml.append('  </url>')
    
    # Stories page
    xml.append('  <url>')
    xml.append(f'    <loc>{base_url}/stories</loc>')
    xml.append('    <changefreq>weekly</changefreq>')
    xml.append('    <priority>0.8</priority>')
    xml.append('  </url>')
    
    # Privacy and Terms
    xml.append('  <url>')
    xml.append(f'    <loc>{base_url}/privacy</loc>')
    xml.append('    <changefreq>monthly</changefreq>')
    xml.append('    <priority>0.3</priority>')
    xml.append('  </url>')
    
    xml.append('  <url>')
    xml.append(f'    <loc>{base_url}/terms</loc>')
    xml.append('    <changefreq>monthly</changefreq>')
    xml.append('    <priority>0.3</priority>')
    xml.append('  </url>')
    
    # Individual recipes
    for recipe in recipes:
        lastmod = recipe.updated_at.strftime('%Y-%m-%d')
        slug_or_id = recipe.slug or str(recipe.id)
        xml.append('  <url>')
        xml.append(f'    <loc>{base_url}/recipe/{slug_or_id}</loc>')
        xml.append(f'    <lastmod>{lastmod}</lastmod>')
        xml.append('    <changefreq>weekly</changefreq>')
        xml.append('    <priority>0.8</priority>')
        xml.append('  </url>')
    
    # Individual stories
    for story in stories:
        lastmod = story.updated_at.strftime('%Y-%m-%d')
        xml.append('  <url>')
        xml.append(f'    <loc>{base_url}/stories/{story.id}</loc>')
        xml.append(f'    <lastmod>{lastmod}</lastmod>')
        xml.append('    <changefreq>monthly</changefreq>')
        xml.append('    <priority>0.7</priority>')
        xml.append('  </url>')
    
    xml.append('</urlset>')
    
    return HttpResponse('\n'.join(xml), content_type='application/xml')