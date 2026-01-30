## 2026-01-30 - Fix hardcoded secrets and prevent user enumeration
**Vulnerability:** Hardcoded Supabase and Paystack public keys in source code, and specific error messages in the password reset flow that leaked user existence.
**Learning:** Initial development often prioritizes speed, leading to hardcoded configuration and overly descriptive error messages for debugging.
**Prevention:** Use environment variables for all configuration keys (even public ones) and follow industry-standard generic error messages for all authentication-related flows.
