from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.text import slugify


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier."""
    
    def create_user(self, email, name, password=None, **extra_fields):
        """Create and save a regular user with email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password=None, **extra_fields):
        """Create and save a superuser with email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that uses email instead of username."""
    
    email = models.EmailField(unique=True, max_length=255)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_redazione = models.BooleanField(
        default=False,
        help_text="Profilo Redazione: le ricette pubblicate appariranno con autore 'Redazione'."
    )
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name
    
    @property
    def display_name(self):
        """Public display name: 'Redazione' for editorial account, else user's name."""
        return "Redazione" if self.is_redazione else self.name


class Recipe(models.Model):
    """Recipe model for storing cooking recipes."""
    
    CATEGORY_CHOICES = [
        ('Bread & Pizza', 'Bread & Pizza'),
        ('Pasta Dishes', 'Pasta Dishes'),
        ('Meat & Poultry', 'Meat & Poultry'),
        ('Desserts', 'Desserts'),
        ('Fish', 'Fish'),
    ]
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, db_index=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    prep_time = models.IntegerField(help_text="Prep time in minutes")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    gluten_free = models.BooleanField(default=False, help_text="Ricetta senza glutine")
    lactose_free = models.BooleanField(default=False, help_text="Ricetta senza lattosio")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        verbose_name="In evidenza",
        help_text="Ricetta in evidenza: mostrata in homepage. Solo una ricetta può essere in evidenza."
    )
    liked_by = models.ManyToManyField(User, through='RecipeLike', related_name='liked_recipes', blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'recipe'
        verbose_name_plural = 'recipes'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_featured:
            Recipe.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)
        if not self.slug and self.title:
            base = slugify(self.title) or 'recipe'
            slug = base
            n = 1
            while Recipe.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    @property
    def likes_count(self):
        """Return the number of likes for this recipe."""
        return self.recipe_likes.count()
    
    @property
    def reports_count(self):
        """Return the number of reports for this recipe."""
        return self.recipe_reports.count()
    
    @property
    def is_flagged(self):
        """Check if recipe has more than 5 reports and should be hidden."""
        return self.recipe_reports.count() > 5


class Ingredient(models.Model):
    """Ingredient model for recipe ingredients."""
    
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.recipe.title} - {self.name}"


class Instruction(models.Model):
    """Instruction model for recipe steps."""
    
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='instructions')
    step = models.TextField()
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.recipe.title} - Step {self.order + 1}"


class RecipeLike(models.Model):
    """Model to track user likes on recipes."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipe_likes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'recipe']
        ordering = ['-created_at']
        verbose_name = 'recipe like'
        verbose_name_plural = 'recipe likes'
    
    def __str__(self):
        return f"{self.user.name} likes {self.recipe.title}"


class RecipeReport(models.Model):
    """Model to track user reports on recipes for inappropriate content."""
    
    REASON_CHOICES = [
        ('inappropriate_content', 'Contenuto Inappropriato'),
        ('spam', 'Spam'),
        ('copyright', 'Violazione Copyright'),
        ('other', 'Altro'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipe_reports')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_reports')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, default='inappropriate_content')
    description = models.TextField(blank=True, help_text="Descrizione opzionale del problema")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'recipe']
        ordering = ['-created_at']
        verbose_name = 'recipe report'
        verbose_name_plural = 'recipe reports'
    
    def __str__(self):
        return f"{self.user.name} reported {self.recipe.title}"


class StoryPost(models.Model):
    """Story post model for chef and staff member stories."""
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    image = models.ImageField(upload_to='stories/', blank=True, null=True)
    role = models.CharField(max_length=100, help_text="e.g., 'Chef', 'Sous Chef', 'Pastry Chef'")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'story post'
        verbose_name_plural = 'story posts'
    
    def __str__(self):
        return self.title
