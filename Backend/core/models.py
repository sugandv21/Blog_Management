from django.db import models
from django.conf import settings

# Use the project's AUTH_USER_MODEL (so custom user models work if you switch later)
User = settings.AUTH_USER_MODEL

class Post(models.Model):
    author = models.ForeignKey(User, related_name="posts", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    body = models.TextField()
    excerpt = models.TextField(blank=True)
    image = models.ImageField(upload_to="posts/", blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ("-created",)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name="comments", on_delete=models.CASCADE)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ("created",)

    def __str__(self):
        # show a short preview to avoid huge admin rows
        preview = (self.body[:75] + "...") if len(self.body) > 75 else self.body
        return f"Comment by {self.author} on {self.post}: {preview}"
