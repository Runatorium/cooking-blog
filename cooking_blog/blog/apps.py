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
            render_disk_path = os.environ.get('RENDER_DISK_PATH')
            
            # Check if parent directory (disk mount path) is writable
            parent_path = media_root.parent
            if render_disk_path and parent_path.exists():
                try:
                    test_parent = parent_path / '.test_write'
                    test_parent.write_text('test')
                    test_parent.unlink()
                except (OSError, PermissionError):
                    logger.error(
                        f"DISK NOT MOUNTED: RENDER_DISK_PATH={render_disk_path} but {parent_path} is read-only. "
                        f"Check Render Dashboard → Disks → verify mount path matches RENDER_DISK_PATH exactly. "
                        f"Run in Shell: 'ls -la {render_disk_path}' and 'mount | grep {render_disk_path}'"
                    )
                    return
            
            try:
                media_root.mkdir(parents=True, exist_ok=True)
                # Verify it's writable
                test_file = media_root / '.test_write'
                try:
                    test_file.write_text('test')
                    test_file.unlink()
                    logger.info(f"MEDIA_ROOT ready: {media_root} (writable, disk mounted at {parent_path})")
                except (OSError, PermissionError) as e:
                    logger.error(f"MEDIA_ROOT exists but not writable: {media_root} - {e}")
            except OSError as e:
                logger.error(
                    f"Could not create MEDIA_ROOT: {media_root} - {e}. "
                    f"RENDER_DISK_PATH={render_disk_path}. "
                    f"Check Render Dashboard → Disks → mount path matches RENDER_DISK_PATH exactly."
                )
