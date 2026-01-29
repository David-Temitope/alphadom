## 2026-01-29 - [Account Enumeration and Hardcoded Keys]
**Vulnerability:** Account enumeration via password reset flow and hardcoded Supabase/Paystack keys in source code.
**Learning:** Even if sign-in uses generic messages, password reset often leaks account existence if not carefully handled. Hardcoded anon keys, while "publishable", should still be in env vars to follow security best practices and prevent accidental exposure of more sensitive keys.
**Prevention:** Always use generic messages for all authentication-related flows (sign-in, sign-up, reset). Use environment variables for all configuration keys.
