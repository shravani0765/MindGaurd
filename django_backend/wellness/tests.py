from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import MindGuardUser


@override_settings(DEBUG=True, FRONTEND_URL="http://127.0.0.1:5173")
class WellnessApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _register_payload(self, email="user@example.com"):
        return {
            "firstName": "Test",
            "lastName": "User",
            "email": email,
            "password": "strongpass123",
            "passwordConfirm": "strongpass123",
            "agreeToTerms": True,
        }

    def _verify_and_login(self, email="user@example.com"):
        register_response = self.client.post(
            "/api/auth/register",
            self._register_payload(email=email),
            format="json",
        )
        verify_response = self.client.get(
            "/api/auth/verify",
            {"token": register_response.json()["verificationUrl"].split("token=")[-1]},
        )
        self.assertEqual(verify_response.status_code, 200)

        login_response = self.client.post(
            "/api/auth/login",
            {"email": email, "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["authToken"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return login_response.json()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_register_login_verify_flow(self):
        register_response = self.client.post(
            "/api/auth/register",
            self._register_payload(),
            format="json",
        )
        self.assertEqual(register_response.status_code, 201)
        self.assertIn("verificationUrl", register_response.json())

        verify_response = self.client.get(
            "/api/auth/verify",
            {"token": register_response.json()["verificationUrl"].split("token=")[-1]},
        )
        self.assertEqual(verify_response.status_code, 200)

        login_response = self.client.post(
            "/api/auth/login",
            {"email": "user@example.com", "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("authToken", login_response.json())
        self.assertEqual(login_response.json()["user"]["firstName"], "Test")

        self.assertTrue(MindGuardUser.objects.get(email="user@example.com").is_verified)

    def test_register_requires_terms_and_matching_passwords(self):
        response = self.client.post(
            "/api/auth/register",
            {
                **self._register_payload(),
                "agreeToTerms": False,
                "passwordConfirm": "differentpass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login_rejects_unverified_account(self):
        self.client.post("/api/auth/register", self._register_payload(), format="json")
        response = self.client.post(
            "/api/auth/login",
            {"email": "user@example.com", "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)

    def test_password_reset_flow(self):
        register_response = self.client.post("/api/auth/register", self._register_payload(), format="json")
        reset_request = self.client.post(
            "/api/auth/password-reset/request",
            {"email": "user@example.com"},
            format="json",
        )
        self.assertEqual(reset_request.status_code, 200)
        self.assertIn("resetUrl", reset_request.json())

        reset_confirm = self.client.post(
            "/api/auth/password-reset/confirm",
            {
                "token": reset_request.json()["resetUrl"].split("token=")[-1],
                "password": "newpass456",
                "passwordConfirm": "newpass456",
            },
            format="json",
        )
        self.assertEqual(reset_confirm.status_code, 200)

        verify_response = self.client.get(
            "/api/auth/verify",
            {"token": register_response.json()["verificationUrl"].split("token=")[-1]},
        )
        self.assertEqual(verify_response.status_code, 200)

        login_response = self.client.post(
            "/api/auth/login",
            {"email": "user@example.com", "password": "newpass456"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)

    def test_text_interaction_creates_log_for_authenticated_user(self):
        session = self._verify_and_login()
        response = self.client.post(
            "/api/interactions/text",
            {"text": "I feel stressed after back-to-back deadlines"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["moodLog"]["emotion"], "stressed")
        self.assertEqual(response.json()["moodLog"]["userId"], session["user"]["id"])

    def test_burnout_risk_uses_history(self):
        self._verify_and_login()
        self.client.post(
            "/api/interactions/text",
            {"text": "I feel stressed today"},
            format="json",
        )
        self.client.post(
            "/api/interactions/text",
            {"text": "I still feel overwhelmed"},
            format="json",
        )
        response = self.client.get("/api/mood/burnout-risk")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.json()["burnoutRisk"], 70)

    def test_cannot_read_another_users_history(self):
        self._verify_and_login()
        other = MindGuardUser.objects.create(
            email="other@example.com",
            first_name="Other",
            last_name="User",
            name="Other User",
            password_hash="noop",
            is_verified=True,
        )
        response = self.client.get(f"/api/mood/history?userId={other.external_id}")
        self.assertEqual(response.status_code, 403)

    def test_notification_flow_supports_registered_push_token(self):
        self._verify_and_login()
        register_response = self.client.post(
            "/api/notifications/register-token",
            {"expoPushToken": "ExponentPushToken[sample]"},
            format="json",
        )
        self.assertEqual(register_response.status_code, 200)

        alert_response = self.client.post(
            "/api/notifications/send-alert",
            {"title": "Take a breath", "body": "Step away for two minutes."},
            format="json",
        )
        self.assertEqual(alert_response.status_code, 200)
        self.assertEqual(alert_response.json()["tickets"][0]["status"], "queued")

    def test_invalid_mood_source_mode_is_rejected(self):
        self._verify_and_login()
        response = self.client.post(
            "/api/mood",
            {"emotion": "calm", "sourceMode": "invalid-mode"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
