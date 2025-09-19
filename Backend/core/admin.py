from django.contrib import admin
from .models import Post, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published", "created")
    search_fields = ("title", "body")
    list_filter = ("published", "author")
    readonly_fields = ("created", "updated")
    ordering = ("-created",)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("post", "author", "created", "active")
    search_fields = ("body",)
    list_filter = ("active",)
    readonly_fields = ("created", "updated")
    ordering = ("created",)
