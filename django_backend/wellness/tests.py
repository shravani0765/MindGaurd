from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import MindGuardUser


@override_settings(DEBUG=True, FRONTEND_URL="http://127.0.0.1:5173")
class WellnessApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_text_interaction_creates_log(self):
        response = self.client.post(
            "/api/interactions/text",
            {"userId": "demo-user", "text": "I feel stressed after back-to-back deadlines"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["moodLog"]["emotion"], "stressed")

    def test_burnout_risk_uses_history(self):
        self.client.post(
            "/api/interactions/text",
            {"userId": "demo-user", "text": "I feel stressed today"},
            format="json",
        )
        self.client.post(
            "/api/interactions/text",
            {"userId": "demo-user", "text": "I still feel overwhelmed"},
            format="json",
        )
        response = self.client.get("/api/mood/burnout-risk?userId=demo-user")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.json()["burnoutRisk"], 70)

    def test_text_analysis_detects_fatigue_and_flags(self):
        response = self.client.post(
            "/api/interactions/text",
            {"userId": "demo-user", "text": "I am exhausted after back-to-back meetings and have no energy"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["moodLog"]["emotion"], "fatigued")
        self.assertTrue(response.json()["moodLog"]["details"]["topicFlags"]["workPressure"])

    def test_register_login_verify_flow(self):
        register_response = self.client.post(
            "/api/auth/register",
            {"email": "user@example.com", "password": "strongpass123", "name": "User"},
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

        self.assertTrue(MindGuardUser.objects.get(email="user@example.com").is_verified)
