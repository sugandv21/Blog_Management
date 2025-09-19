# core/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

from .models import Post, Comment


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())],
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]
        user = User.objects.create_user(username=username, email=email, password=password)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "post", "author", "body", "created", "updated", "active")
        read_only_fields = ("id", "created", "updated", "author")


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)

    # image (read) and image_file (write) pattern:
    image = serializers.ImageField(read_only=True)
    image_file = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "author",
            "title",
            "body",
            "excerpt",
            "image",
            "image_file",
            "created",
            "updated",
            "published",
            "comments",
            "comment_count",
        )
        read_only_fields = ("id", "created", "updated", "author", "comment_count", "image")

    def create(self, validated_data):
        # pop image_file if provided and handle separately
        image = validated_data.pop("image_file", None)
        post = Post.objects.create(**validated_data)
        if image:
            post.image = image
            post.save()
        return post

    def update(self, instance, validated_data):
        image = validated_data.pop("image_file", None)

        # update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # image handling:
        # - if image is not None (file provided) set it
        # - if image is None and request provided empty string to signal removal, set to None
        # Note: DRF will pass empty string for file fields if client sends ''. We handle that case.
        if image is not None:
            # if image is an empty string -> remove existing image
            if isinstance(image, str) and image == "":
                instance.image = None
            else:
                instance.image = image

        instance.save()
        return instance
