"""
URL configuration for cooking_blog project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import logging
from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.views.static import serve as static_serve
from django.http import Http404

logger = logging.getLogger(__name__)


def serve_media(request, path):
    """Serve media files; log MEDIA_ROOT and path when file is missing (helps debug uploads)."""
    document_root = Path(settings.MEDIA_ROOT).resolve()
    full_path = (document_root / path).resolve()
    if not str(full_path).startswith(str(document_root)) or not full_path.exists() or not full_path.is_file():
        logger.warning(
            "Media not found: path=%s MEDIA_ROOT=%s exists=%s",
            path, settings.MEDIA_ROOT, document_root.exists(),
        )
        raise Http404("Media not found")
    return static_serve(request, path, document_root=settings.MEDIA_ROOT)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('blog.urls')),
]

# Serve media files (uploaded images) with logging on 404
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_media),
]
# Static files: only in development (production uses WhiteNoise)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
