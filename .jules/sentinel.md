# Sentinel Journal

## 2025-05-22 - Misleading Auth Error Messages
**Vulnerability:** Misleading and overly specific error messages in authentication flows.
**Learning:** The application was hardcoded to return "Account doesn't exist" for almost any error during sign-in, sign-up, and password reset. This not only provided a poor user experience but also leaked specific information (or misinformed users/attackers) about account existence.
**Prevention:** Always use generic error messages for authentication (e.g., "Invalid email or password") to prevent account enumeration. Ensure that error messages for sign-up and password reset are accurate yet secure, and use a production-safe logger to record actual error details for debugging.
