from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Recipe, Ingredient, Instruction, StoryPost, RecipeLike, RecipeReport


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model."""
    list_display = ('email', 'name', 'is_redazione', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_redazione', 'is_staff', 'is_active', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name',)}),
        ('Profilo', {'fields': ('is_redazione',), 'description': "Conto Redazione: le ricette appariranno con autore 'Redazione'."}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'name')
    ordering = ('email',)


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1


class InstructionInline(admin.TabularInline):
    model = Instruction
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    """Admin configuration for Recipe model."""
    list_display = ('title', 'in_evidenza_badge', 'author', 'category', 'prep_time', 'gluten_free', 'lactose_free', 'is_featured', 'created_at', 'is_published')
    list_editable = ('is_featured',)
    list_filter = ('category', 'is_published', 'is_featured', 'gluten_free', 'lactose_free', 'created_at')
    search_fields = ('title', 'description', 'author__name', 'author__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [IngredientInline, InstructionInline]

    @admin.display(description='Ricetta in evidenza')
    def in_evidenza_badge(self, obj):
        if obj.is_featured:
            return format_html(
                '<span style="background:#c9a227;color:#1a252f;padding:4px 10px;border-radius:6px;font-weight:bold;">⭐ In evidenza</span>'
            )
        return format_html('<span style="color:#999;">—</span>')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'prep_time', 'author', 'image')
        }),
        ('Dietary Information', {
            'fields': ('gluten_free', 'lactose_free')
        }),
        ('Status', {
            'fields': ('is_published', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(RecipeLike)
class RecipeLikeAdmin(admin.ModelAdmin):
    """Admin configuration for RecipeLike model."""
    list_display = ('user', 'recipe', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__name', 'user__email', 'recipe__title')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(RecipeReport)
class RecipeReportAdmin(admin.ModelAdmin):
    """Admin configuration for RecipeReport model."""
    list_display = ('user', 'recipe', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('user__name', 'user__email', 'recipe__title', 'description')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(StoryPost)
class StoryPostAdmin(admin.ModelAdmin):
    """Admin configuration for StoryPost model."""
    list_display = ('title', 'author', 'role', 'created_at', 'is_published')
    list_filter = ('is_published', 'created_at', 'role')
    search_fields = ('title', 'content', 'author__name', 'author__email', 'role')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Story Information', {
            'fields': ('title', 'content', 'author', 'role', 'image')
        }),
        ('Status', {
            'fields': ('is_published',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
