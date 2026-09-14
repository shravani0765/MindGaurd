from rest_framework import serializers

from .models import MoodLog


class AuthRegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=60)
    lastName = serializers.CharField(max_length=60)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128)
    passwordConfirm = serializers.CharField(min_length=8, max_length=128)
    agreeToTerms = serializers.BooleanField()

    def validate(self, attrs):
        if attrs["password"] != attrs["passwordConfirm"]:
            raise serializers.ValidationError({"passwordConfirm": "Passwords do not match"})
        if not attrs["agreeToTerms"]:
            raise serializers.ValidationError({"agreeToTerms": "You must agree before creating an account"})
        return attrs


class AuthLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, max_length=128)
    passwordConfirm = serializers.CharField(min_length=8, max_length=128)

    def validate(self, attrs):
        if attrs["password"] != attrs["passwordConfirm"]:
            raise serializers.ValidationError({"passwordConfirm": "Passwords do not match"})
        return attrs


class MoodLogSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="entry_id", read_only=True)
    userId = serializers.CharField(source="client_user_id", read_only=True)
    sourceMode = serializers.CharField(source="source_mode", read_only=True)

    class Meta:
        model = MoodLog
        fields = ["id", "userId", "timestamp", "emotion", "sourceMode", "details"]


class MoodEntrySerializer(serializers.Serializer):
    userId = serializers.CharField(max_length=64, required=False, allow_blank=True)
    emotion = serializers.CharField(max_length=32)
    sourceMode = serializers.ChoiceField(choices=[choice[0] for choice in MoodLog.SOURCE_CHOICES])
    details = serializers.JSONField(required=False)


class TokenRegistrationSerializer(serializers.Serializer):
    userId = serializers.CharField(max_length=64, required=False, allow_blank=True)
    expoPushToken = serializers.CharField(max_length=255)


class NotificationSerializer(serializers.Serializer):
    userId = serializers.CharField(max_length=64, required=False, allow_blank=True)
    title = serializers.CharField(max_length=120)
    body = serializers.CharField(max_length=500)
    data = serializers.JSONField(required=False)
