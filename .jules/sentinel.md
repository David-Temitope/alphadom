## 2025-05-22 - [Sensitive Data Disclosure in Main Entry Point]
**Vulnerability:** A debug function `testSupabase` in `src/main.tsx` was logging the entire `profiles` table to the browser console.
**Learning:** Development-time debug code left in the main entry point can lead to massive data exposure if not properly guarded or removed before production.
**Prevention:** Use the established production-safe logger utility (`src/utils/logger.ts`) and ensure all debug-only code is either removed or conditionally executed based on the environment (e.g., `import.meta.env.DEV`).

## 2025-05-22 - [User Enumeration via Password Reset]
**Vulnerability:** Password reset flow returned specific "Invalid email" messages.
**Learning:** Specific error messages in authentication flows allow attackers to verify whether specific emails have accounts on the platform.
**Prevention:** Always use generic messages like "If an account exists, you will receive a reset link" to ensure the response is identical regardless of user existence.

## 2026-01-31 - [Defense-in-Depth Content Security Policy]
**Vulnerability:** The application lacked a Content Security Policy (CSP), leaving it more vulnerable to Cross-Site Scripting (XSS) and other injection attacks if other defenses failed.
**Learning:** While server-side headers are preferred, adding a CSP via a meta tag in `index.html` provides a necessary client-side fallback and defense-in-depth for single-page applications.
**Prevention:** Always include a baseline CSP meta tag in the main `index.html` tailored to the application's external dependencies (Supabase, Paystack, Google Fonts).

## 2026-02-02 - [Consistent Password Policy Enforcement]
**Vulnerability:** Inconsistent password validation between Sign Up and Password Reset flows allowed for weak passwords to be set during reset, bypassing the strong password policy.
**Learning:** Security policies must be enforced consistently across all entry points that modify sensitive credentials. Decentralized validation logic leads to gaps and weaker defense.
**Prevention:** Centralize security validation logic into shared utilities and ensure all related flows (creation, reset, update) utilize the same enforcement and UI feedback.
