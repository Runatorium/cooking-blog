from django.apps import AppConfig


class BlogConfig(AppConfig):
    name = 'blog'

    def ready(self):
        # Create MEDIA_ROOT at runtime when using a persistent disk (path exists = disk is mounted).
        # Skip during build, when the disk is not available.
        from django.conf import settings
        if getattr(settings, 'MEDIA_ROOT', None):
            try:
                settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
            except OSError:
                pass  # Build environment or read-only; ignore
