# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")
router.register(r"comments", CommentViewSet, basename="comment")

app_name = "core"

urlpatterns = [
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    # registration endpoint
    path("v1/auth/register/", RegisterView.as_view(), name="auth_register"),
    # JWT token endpoints
    path("v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
