## 2025-05-22 - [Hardcoded Secrets and Account Enumeration]
**Vulnerability:** Hardcoded Supabase and Paystack keys in client-side code; Account enumeration in password reset flow.
**Learning:** Even if keys are meant for client-side use, they should be managed via environment variables to follow security best practices and prevent accidental exposure in source control. Detailed error messages in auth flows can leak user existence.
**Prevention:** Always use `import.meta.env` for configuration keys. Use generic success messages for password reset and account creation to prevent user enumeration. Use internal logging for detailed error tracking.
