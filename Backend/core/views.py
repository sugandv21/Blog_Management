# core/views.py
from rest_framework import viewsets, filters, permissions, generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from django.core.mail import send_mail

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer, RegisterSerializer
from .permissions import IsOwnerOrReadOnly


class RegisterView(generics.CreateAPIView):
    """
    Registration endpoint that creates a new user and returns JWT tokens.
    URL: POST /api/v1/auth/register/
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # send welcome email (silently fail if email not configured)
        if getattr(settings, "DEFAULT_FROM_EMAIL", None) and user.email:
            try:
                send_mail(
                    "Welcome to BlogApp",
                    f"Hi {user.username},\n\nYour account has been created successfully!",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass
        return user

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        # issue JWT tokens for the newly created user
        refresh = RefreshToken.for_user(user)
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD for posts. Accepts multipart/form-data for image uploads.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]  # allow file uploads
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["author__username", "published"]
    search_fields = ["title", "body"]
    ordering_fields = ["created", "updated"]

    def perform_create(self, serializer):
        # set author to current user
        serializer.save(author=self.request.user)


    def get_queryset(self):
        qs = Post.objects.all()
        # If GET and anonymous, only show published posts
        if self.request.method == "GET" and not self.request.user.is_authenticated:
            return qs.filter(published=True)
        return qs


class CommentViewSet(viewsets.ModelViewSet):
    """
    CRUD for comments.
    """
    queryset = Comment.objects.select_related("author", "post").all()
    serializer_class = CommentSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["post", "author__username"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
