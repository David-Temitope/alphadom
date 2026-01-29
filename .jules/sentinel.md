## 2025-05-15 - [Hardcoded Secrets]
**Vulnerability:** Critical configuration keys for Supabase (URL and Anon Key) and Paystack (Public Key) were hardcoded in the source code.
**Learning:** Hardcoding keys simplifies development but poses a significant security risk by exposing credentials in the version control system.
**Prevention:** Always use environment variables (e.g., `import.meta.env.VITE_*`) for sensitive configuration and ensure they are managed through the deployment platform's environment settings.
