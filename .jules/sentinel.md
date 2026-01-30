## 2025-05-22 - [Sensitive Data Disclosure in Main Entry Point]
**Vulnerability:** A debug function `testSupabase` in `src/main.tsx` was logging the entire `profiles` table to the browser console.
**Learning:** Development-time debug code left in the main entry point can lead to massive data exposure if not properly guarded or removed before production.
**Prevention:** Use the established production-safe logger utility (`src/utils/logger.ts`) and ensure all debug-only code is either removed or conditionally executed based on the environment (e.g., `import.meta.env.DEV`).

## 2025-05-22 - [User Enumeration via Password Reset]
**Vulnerability:** Password reset flow returned specific "Invalid email" messages.
**Learning:** Specific error messages in authentication flows allow attackers to verify whether specific emails have accounts on the platform.
**Prevention:** Always use generic messages like "If an account exists, you will receive a reset link" to ensure the response is identical regardless of user existence.
