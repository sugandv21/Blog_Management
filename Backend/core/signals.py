from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.core.mail import send_mail

try:
    from .models import Comment
except Exception:
    Comment = None

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created and instance.email:
        subject = "Welcome to BlogApp"
        message = f"Hi {instance.username},\n\nYour account has been created successfully!"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.email], fail_silently=True)


@receiver(post_save, sender=Comment) if Comment else (lambda *a, **k: None)
def notify_post_owner_on_comment(sender, instance, created, **kwargs):
    # if Comment model isn't available yet, this function is effectively a no-op
    if not Comment or not created:
        return
    post = instance.post
    post_owner = post.author
    if post_owner.email and post_owner != instance.author:
        subject = f"New comment on your post '{post.title}'"
        message = (
            f"Hi {post_owner.username},\n\n"
            f"{instance.author.username} commented on your post:\n\n"
            f"\"{instance.body}\"\n\n"
            "Visit the app to reply."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [post_owner.email], fail_silently=True)

