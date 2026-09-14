import uuid

from django.db import models
from django.utils import timezone


class MindGuardUser(models.Model):
    external_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120, blank=True)
    first_name = models.CharField(max_length=60, blank=True, default="")
    last_name = models.CharField(max_length=60, blank=True, default="")
    password_hash = models.CharField(max_length=128)
    is_verified = models.BooleanField(default=False)
    expo_push_token = models.CharField(max_length=255, blank=True)
    burnout_score = models.PositiveSmallIntegerField(default=24)
    last_detected_emotion = models.CharField(max_length=32, default="neutral")
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class MoodLog(models.Model):
    SOURCE_CHOICES = [
        ("text", "Text"),
        ("voice", "Voice"),
        ("video", "Video"),
        ("combo", "Combo"),
    ]

    entry_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(
        MindGuardUser,
        null=True,
        blank=True,
        related_name="mood_logs",
        on_delete=models.SET_NULL,
    )
    client_user_id = models.CharField(max_length=64, db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    emotion = models.CharField(max_length=32)
    source_mode = models.CharField(max_length=16, choices=SOURCE_CHOICES)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.client_user_id} · {self.emotion} · {self.source_mode}"
