#backend\decision_engine.py

"""
Decision Engine — Maps (emotion × scenario) to attack parameters.
Generates dynamic phishing popup content with template variation.
"""

import random
from typing import Optional


# ── Scenario Definitions ──────────────────────────────────────────

SCENARIOS = {
    "banking": {
        "name": "Banking",
        "icon": "🏦",
        "description": "Online banking session",
        "context": "financial",
    },
    "interview": {
        "name": "Interview",
        "icon": "💼",
        "description": "Job interview preparation",
        "context": "career",
    },
    "exam": {
        "name": "Exam",
        "icon": "📝",
        "description": "Online examination",
        "context": "academic",
    },
    "work": {
        "name": "Work",
        "icon": "🖥️",
        "description": "Professional work session",
        "context": "professional",
    },
    "relationship": {
        "name": "Relationship",
        "icon": "💬",
        "description": "Social / messaging session",
        "context": "personal",
    },
}


# ── Attack Templates ──────────────────────────────────────────────

ATTACK_TEMPLATES = {
    "urgency": {
        "banking": [
            {
                "title": "⚠️ Urgent: Suspicious Transaction Detected",
                "message": "We detected an unauthorized transaction of $2,847.00 from your account. Verify your identity immediately to prevent further charges.",
                "button": "Verify Now",
                "secondary": "Ignore (not recommended)",
            },
            {
                "title": "🔒 Account Security Alert",
                "message": "Your banking session will expire in 30 seconds due to unusual activity. Re-enter your credentials to maintain access.",
                "button": "Re-authenticate",
                "secondary": "Log Out",
            },
            {
                "title": "🚨 Wire Transfer Pending Approval",
                "message": "A wire transfer of $5,200.00 to an unknown account requires your immediate confirmation. If this wasn't you, click below.",
                "button": "Cancel Transfer",
                "secondary": "This was me",
            },
        ],
        "interview": [
            {
                "title": "📋 Interview System Update Required",
                "message": "Your video interview platform requires an urgent plugin update. Install now to avoid disconnection during your session.",
                "button": "Install Update",
                "secondary": "Remind Later",
            },
            {
                "title": "⏰ Interview Rescheduled — Action Required",
                "message": "Your interviewer has rescheduled. Confirm your availability in the next 60 seconds or the slot will be given to another candidate.",
                "button": "Confirm Availability",
                "secondary": "Decline",
            },
        ],
        "exam": [
            {
                "title": "🔴 Exam Session Expiring",
                "message": "Your exam session token is expiring. Re-validate your student credentials to continue your test without losing progress.",
                "button": "Re-validate Now",
                "secondary": "Contact Support",
            },
            {
                "title": "⚠️ Proctoring Software Error",
                "message": "The proctoring system detected an anomaly. Reinstall the monitoring agent or your exam will be flagged for review.",
                "button": "Fix Now",
                "secondary": "Ignore Warning",
            },
        ],
        "work": [
            {
                "title": "🔐 VPN Session Expired",
                "message": "Your corporate VPN session has expired. Re-enter your enterprise credentials to restore access to internal resources.",
                "button": "Reconnect VPN",
                "secondary": "Work Offline",
            },
            {
                "title": "📧 Urgent: IT Security Compliance",
                "message": "Your workstation failed the latest security compliance check. Apply the critical patch immediately to avoid network isolation.",
                "button": "Apply Patch",
                "secondary": "Schedule Later",
            },
        ],
        "relationship": [
            {
                "title": "⚠️ Account Verification Required",
                "message": "Your messaging account has been flagged for suspicious activity. Verify your phone number to prevent account suspension.",
                "button": "Verify Now",
                "secondary": "Skip",
            },
            {
                "title": "🔔 New Login from Unknown Device",
                "message": "Someone logged into your account from an unrecognized device in another country. Secure your account immediately.",
                "button": "Secure Account",
                "secondary": "It was me",
            },
        ],
    },
    "fear": {
        "banking": [
            {
                "title": "🚨 CRITICAL: Account Breach Detected",
                "message": "Your account credentials were found on the dark web. 3 unauthorized access attempts were blocked. Change your password NOW.",
                "button": "Change Password",
                "secondary": "I'll do it later",
            },
            {
                "title": "⛔ Legal Hold on Your Account",
                "message": "Your bank account has been flagged by regulatory authorities. Submit verification documents within 2 minutes to avoid account freeze.",
                "button": "Submit Documents",
                "secondary": "Contact Bank",
            },
        ],
        "interview": [
            {
                "title": "🚫 Background Check Alert",
                "message": "An issue was found during your pre-employment background check. Review and dispute the findings before your interview begins.",
                "button": "Review Findings",
                "secondary": "Dismiss",
            },
        ],
        "exam": [
            {
                "title": "🚨 Academic Integrity Violation",
                "message": "The proctoring system flagged potential cheating behavior. Click to submit an explanation or your exam will be automatically voided.",
                "button": "Submit Explanation",
                "secondary": "Contact Dean",
            },
        ],
        "work": [
            {
                "title": "⛔ Data Breach: Your Credentials Exposed",
                "message": "A data breach at a third-party vendor exposed your work email and password. Reset your credentials before unauthorized access occurs.",
                "button": "Reset Credentials",
                "secondary": "Notify IT",
            },
        ],
        "relationship": [
            {
                "title": "🚨 Privacy Alert: Photos Leaked",
                "message": "Your private photos may have been accessed by an unauthorized party. Review and secure your media files immediately.",
                "button": "Secure Files",
                "secondary": "Learn More",
            },
        ],
    },
    "reward": {
        "banking": [
            {
                "title": "🎉 Cashback Reward Available!",
                "message": "Congratulations! You've earned $150 in cashback rewards. Claim your reward before it expires in 5 minutes.",
                "button": "Claim Reward",
                "secondary": "View Details",
            },
            {
                "title": "💰 Exclusive Offer: Premium Account Upgrade",
                "message": "You've been selected for a free premium banking upgrade with 5% higher interest rates. Activate today — limited slots!",
                "button": "Activate Now",
                "secondary": "Not Interested",
            },
        ],
        "interview": [
            {
                "title": "🌟 Congratulations! Pre-Selected",
                "message": "Based on your profile, you've been pre-selected for the position! Complete a quick verification to fast-track your onboarding.",
                "button": "Complete Verification",
                "secondary": "View Offer",
            },
        ],
        "exam": [
            {
                "title": "🏆 Bonus Points Available",
                "message": "You qualify for bonus credit points! Complete a quick supplementary assessment (2 mins) for extra marks.",
                "button": "Start Assessment",
                "secondary": "Skip Bonus",
            },
        ],
        "work": [
            {
                "title": "🎁 Employee Recognition Award",
                "message": "You've been nominated for Employee of the Quarter! Fill out a short acceptance form to claim your $500 gift card.",
                "button": "Accept Award",
                "secondary": "View Nomination",
            },
        ],
        "relationship": [
            {
                "title": "💝 Secret Admirer Message",
                "message": "Someone sent you an anonymous message! Verify your identity to read it. This link expires in 3 minutes.",
                "button": "Read Message",
                "secondary": "Ignore",
            },
        ],
    },
}


# ── Decision Rules ────────────────────────────────────────────────

DECISION_RULES = {
    "stressed": {
        "attack_types": ["urgency", "fear"],
        "urgency_weight": 0.6,
        "fear_weight": 0.4,
        "urgency_level": "critical",
        "trigger_delay_range": (2, 3),
    },
    "relaxed": {
        "attack_types": ["reward"],
        "urgency_weight": 0.0,
        "fear_weight": 0.0,
        "urgency_level": "low",
        "trigger_delay_range": (3, 4),
    },
    "neutral": {
        "attack_types": ["urgency", "reward"],
        "urgency_weight": 0.5,
        "fear_weight": 0.0,
        "urgency_level": "medium",
        "trigger_delay_range": (2, 4),
    },
}


class DecisionEngine:
    """Maps emotion + scenario to dynamic attack parameters."""

    def __init__(self):
        self._last_attack: Optional[dict] = None

    def get_scenarios(self) -> dict:
        """Return all available scenarios."""
        return SCENARIOS

    def decide(self, emotion: str, scenario: str, confidence: float = 0.5) -> dict:
        """
        Given an emotion state and scenario, produce attack parameters.
        """
        emotion = emotion.lower()
        scenario = scenario.lower()

        if emotion not in DECISION_RULES:
            emotion = "neutral"
        if scenario not in SCENARIOS:
            scenario = "banking"

        rules = DECISION_RULES[emotion]

        # Select attack type based on weights
        attack_type = random.choice(rules["attack_types"])

        # Determine trigger type
        trigger_map = {
            "urgency": "time_pressure",
            "fear": "threat_indicator",
            "reward": "incentive_lure",
        }
        trigger_type = trigger_map.get(attack_type, "time_pressure")

        # Generate popup content
        popup = self._generate_popup(attack_type, scenario)

        # Calculate trigger delay
        delay_min, delay_max = rules["trigger_delay_range"]
        trigger_delay = round(random.uniform(delay_min, delay_max), 1)

        result = {
            "emotion": emotion,
            "scenario": scenario,
            "scenario_info": SCENARIOS[scenario],
            "attack_type": attack_type,
            "trigger_type": trigger_type,
            "urgency_level": rules["urgency_level"],
            "confidence": confidence,
            "trigger_delay": trigger_delay,
            "popup": popup,
        }

        self._last_attack = result
        return result

    def _generate_popup(self, attack_type: str, scenario: str) -> dict:
        """Pick a random popup template for the given attack type and scenario."""
        templates = ATTACK_TEMPLATES.get(attack_type, {}).get(scenario, [])

        if not templates:
            # Fallback generic popup
            return {
                "title": "⚠️ System Alert",
                "message": "An important action requires your attention. Please respond immediately.",
                "button": "Take Action",
                "secondary": "Dismiss",
            }

        return random.choice(templates)

    def get_last_attack(self) -> Optional[dict]:
        return self._last_attack
