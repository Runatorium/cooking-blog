from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Recipe, Ingredient, Instruction, StoryPost, RecipeReport
from .content_moderation import contains_inappropriate_content


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label='Confirm Password'
    )
    
    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'password2')
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user."""
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'display_name', 'is_redazione', 'date_joined', 'is_active')
        read_only_fields = ('id', 'display_name', 'is_redazione', 'date_joined', 'is_active')


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer for ingredients."""
    
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'order')
        read_only_fields = ('id',)


class InstructionSerializer(serializers.ModelSerializer):
    """Serializer for instructions."""
    
    class Meta:
        model = Instruction
        fields = ('id', 'step', 'order')
        read_only_fields = ('id',)


class RecipeSerializer(serializers.ModelSerializer):
    """Serializer for recipe details."""
    author = UserSerializer(read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    instructions = InstructionSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = (
            'id', 'slug', 'title', 'description', 'final_comment', 'category', 'prep_time',
            'author', 'image', 'gluten_free', 'lactose_free',
            'created_at', 'updated_at', 'is_published',
            'ingredients', 'instructions', 'likes_count', 'is_liked'
        )
        read_only_fields = ('id', 'slug', 'author', 'created_at', 'updated_at', 'likes_count', 'is_liked')
    
    def get_is_liked(self, obj):
        """Check if the current user has liked this recipe."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.recipe_likes.filter(user=request.user).exists()
        return False


class RecipeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating recipes."""
    ingredients = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True
    )
    instructions = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True
    )
    image = serializers.ImageField(required=False, allow_null=True)
    
    def validate_image(self, value):
        """Validate image file size (max 5MB)."""
        if value:
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            if value.size > max_size:
                raise serializers.ValidationError(
                    f"L'immagine è troppo grande. La dimensione massima consentita è 5MB. "
                    f"Dimensione attuale: {value.size / (1024 * 1024):.2f}MB"
                )
        return value

    def validate_title(self, value):
        if contains_inappropriate_content(value):
            raise serializers.ValidationError(
                'Il titolo contiene espressioni non consentite. Modifica il testo e riprova.'
            )
        return value

    def validate_description(self, value):
        if contains_inappropriate_content(value):
            raise serializers.ValidationError(
                'La descrizione contiene espressioni non consentite. Modifica il testo e riprova.'
            )
        return value

    def validate(self, attrs):
        ingredients = attrs.get('ingredients', [])
        instructions = attrs.get('instructions', [])
        for i, text in enumerate(ingredients):
            if text and contains_inappropriate_content(text):
                raise serializers.ValidationError({
                    'ingredients': 'Uno o più ingredienti contengono espressioni non consentite.'
                })
        for i, text in enumerate(instructions):
            if text and contains_inappropriate_content(text):
                raise serializers.ValidationError({
                    'instructions': 'Una o più istruzioni contengono espressioni non consentite.'
                })
        return attrs
    
    class Meta:
        model = Recipe
        fields = (
            'title', 'description', 'final_comment', 'category', 'prep_time',
            'ingredients', 'instructions', 'image', 'gluten_free', 'lactose_free'
        )
    
    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        instructions_data = validated_data.pop('instructions', [])
        
        # Remove author from validated_data if present (it will be set from request.user)
        # This prevents "multiple values for keyword argument 'author'" error
        if 'author' in validated_data:
            del validated_data['author']
        
        # Set the author from the request user
        author = self.context['request'].user
        recipe = Recipe.objects.create(
            author=author,
            **validated_data
        )
        
        # Create ingredients
        for index, ingredient_name in enumerate(ingredients_data):
            if ingredient_name and ingredient_name.strip():  # Only create if not empty
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ingredient_name.strip(),
                    order=index
                )
        
        # Create instructions
        for index, instruction_step in enumerate(instructions_data):
            if instruction_step and instruction_step.strip():  # Only create if not empty
                Instruction.objects.create(
                    recipe=recipe,
                    step=instruction_step.strip(),
                    order=index
                )
        
        return recipe


class RecipeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating recipes."""
    ingredients = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    instructions = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    image = serializers.ImageField(required=False, allow_null=True)
    
    def validate_image(self, value):
        """Validate image file size (max 5MB)."""
        if value:
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            if value.size > max_size:
                raise serializers.ValidationError(
                    f"L'immagine è troppo grande. La dimensione massima consentita è 5MB. "
                    f"Dimensione attuale: {value.size / (1024 * 1024):.2f}MB"
                )
        return value

    def validate_title(self, value):
        if contains_inappropriate_content(value):
            raise serializers.ValidationError(
                'Il titolo contiene espressioni non consentite. Modifica il testo e riprova.'
            )
        return value

    def validate_description(self, value):
        if contains_inappropriate_content(value):
            raise serializers.ValidationError(
                'La descrizione contiene espressioni non consentite. Modifica il testo e riprova.'
            )
        return value

    def validate(self, attrs):
        ingredients = attrs.get('ingredients')
        instructions = attrs.get('instructions')
        if ingredients is not None:
            for text in ingredients:
                if text and contains_inappropriate_content(text):
                    raise serializers.ValidationError({
                        'ingredients': 'Uno o più ingredienti contengono espressioni non consentite.'
                    })
        if instructions is not None:
            for text in instructions:
                if text and contains_inappropriate_content(text):
                    raise serializers.ValidationError({
                        'instructions': 'Una o più istruzioni contengono espressioni non consentite.'
                    })
        return attrs
    
    class Meta:
        model = Recipe
        fields = (
            'title', 'description', 'final_comment', 'category', 'prep_time',
            'ingredients', 'instructions', 'image', 'gluten_free', 'lactose_free', 'is_published'
        )
    
    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        instructions_data = validated_data.pop('instructions', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update ingredients if provided
        if ingredients_data is not None:
            # Delete existing ingredients
            instance.ingredients.all().delete()
            # Create new ingredients
            for index, ingredient_name in enumerate(ingredients_data):
                if ingredient_name and ingredient_name.strip():
                    Ingredient.objects.create(
                        recipe=instance,
                        name=ingredient_name.strip(),
                        order=index
                    )
        
        # Update instructions if provided
        if instructions_data is not None:
            # Delete existing instructions
            instance.instructions.all().delete()
            # Create new instructions
            for index, instruction_step in enumerate(instructions_data):
                if instruction_step and instruction_step.strip():
                    Instruction.objects.create(
                        recipe=instance,
                        step=instruction_step.strip(),
                        order=index
                    )
        
        return instance


class RecipeReportSerializer(serializers.ModelSerializer):
    """Serializer for recipe reports."""
    user = UserSerializer(read_only=True)

    def validate_description(self, value):
        if value and contains_inappropriate_content(value):
            raise serializers.ValidationError(
                'La descrizione della segnalazione contiene espressioni non consentite.'
            )
        return value
    
    class Meta:
        model = RecipeReport
        fields = ('id', 'user', 'recipe', 'reason', 'description', 'created_at')
        read_only_fields = ('id', 'user', 'recipe', 'created_at')


class StoryPostSerializer(serializers.ModelSerializer):
    """Serializer for story posts."""
    author = UserSerializer(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = StoryPost
        fields = (
            'id', 'title', 'content', 'author', 'image', 'role',
            'created_at', 'updated_at', 'is_published'
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')