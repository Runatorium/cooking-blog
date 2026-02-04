import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)


class BlogConfig(AppConfig):
    name = 'blog'

    def ready(self):
        # Create MEDIA_ROOT at runtime when using a persistent disk (path exists = disk is mounted).
        # Skip during build, when the disk is not available.
        from django.conf import settings
        import os
        if getattr(settings, 'MEDIA_ROOT', None):
            media_root = settings.MEDIA_ROOT
            try:
                media_root.mkdir(parents=True, exist_ok=True)
                # Verify it's writable
                test_file = media_root / '.test_write'
                try:
                    test_file.write_text('test')
                    test_file.unlink()
                    logger.info(f"MEDIA_ROOT ready: {media_root} (writable)")
                except (OSError, PermissionError) as e:
                    logger.warning(f"MEDIA_ROOT exists but not writable: {media_root} - {e}")
            except OSError as e:
                logger.warning(f"Could not create MEDIA_ROOT: {media_root} - {e}. Check RENDER_DISK_PATH matches disk mount path.")
