"""
Content moderation: regex-based check for spam and inappropriate content.
Used to validate user-generated text (recipe title, description, etc.).
"""
import re

# Compiled patterns (case-insensitive). Combined from user-provided regex groups.
# Group 1: explicit profanity
_PATTERN_1 = re.compile(
    r'\b('
    r'cazz[aoi]*|cazzat[aie]*|'
    r'stronz[aoi]*|'
    r'merd[aoi]*|'
    r'vaffan\s*c\W*l[o]*|'
    r'fancul[oai]*|affancul[oai]*|'
    r'puttan[aie]*|'
    r'troi[aie]*|'
    r'bastard[aoi]*|'
    r'coglion[aie]*|'
    r'minchi[aie]*|'
    r'testa\s*di\s*cazz[oai]*'
    r')\b',
    re.IGNORECASE,
)

# Group 2: explicit terms
_PATTERN_2 = re.compile(
    r'\b('
    r'figa|fica|'
    r'cul[oai]*|'
    r'pen[eis]*|'
    r'sbor+r[aie]*|'
    r'scop[aoi]*|'
    r'incul[aoi]*|'
    r'seg[ahe]*'
    r')\b',
    re.IGNORECASE,
)

# Group 3: insults
_PATTERN_3 = re.compile(
    r'\b('
    r'idiot[aie]*|'
    r'deficient[eis]*|'
    r'cretin[aoi]*|'
    r'imbecill[eis]*|'
    r'fallit[oai]*|'
    r'ritardat[oai]*'
    r')\b',
    re.IGNORECASE,
)

# Evasion: characters/symbols between letters
_PATTERN_EVASION = re.compile(
    r'('
    r'c[\W_]*a[\W_]*z[\W_]*z[\W_]*o|'
    r's[\W_]*t[\W_]*r[\W_]*o[\W_]*n[\W_]*z[\W_]*o|'
    r'v[\W_]*a[\W_]*f[\W_]*f[\W_]*a[\W_]*n[\W_]*c[\W_]*u[\W_]*l[\W_]*o'
    r')',
    re.IGNORECASE,
)

_ALL_PATTERNS = (_PATTERN_1, _PATTERN_2, _PATTERN_3, _PATTERN_EVASION)


def contains_inappropriate_content(text: str) -> bool:
    """
    Return True if the text contains any blocked (spam/inappropriate) pattern.
    """
    if not text or not isinstance(text, str):
        return False
    normalized = text.strip()
    if not normalized:
        return False
    for pattern in _ALL_PATTERNS:
        if pattern.search(normalized):
            return True
    return False


def validate_content_clean(text: str, field_name: str = 'content'):
    """
    Raise serializers.ValidationError if text contains inappropriate content.
    Use in serializers for user-facing error message.
    """
    if contains_inappropriate_content(text):
        from rest_framework import serializers
        raise serializers.ValidationError(
            'Il testo contiene espressioni non consentite. Modifica il contenuto e riprova.'
        )
