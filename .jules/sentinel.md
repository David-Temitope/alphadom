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

## 2026-02-03 - [Public Storage of Sensitive PII]
**Vulnerability:** Identity verification documents (NIN, Driver's License) were uploaded to the public 'product-images' bucket, making them accessible via static URLs without authentication.
**Learning:** Defaulting to public storage for ease of implementation can lead to High-severity data leaks of sensitive Personally Identifiable Information (PII).
**Prevention:** Always use private storage buckets for PII. Implement a secure access layer using signed URLs (e.g., via a 'SecureImage' component) and strictly enforce Row Level Security (RLS) policies for both owners and authorized admins.

## 2025-05-23 - [Information Disclosure via Sensitive Data Logging]
**Vulnerability:** Admin pages and hooks were logging sensitive data structures (entire order arrays, user profiles) to the browser console using direct `console.log` calls.
**Learning:** Even if administrative access is restricted, logging full data objects to the client console creates a significant information disclosure risk. Rendering-time logs are particularly leaky as they execute on every state update.
**Prevention:** Standardize on a production-safe logger utility (like `src/utils/logger.ts`) that conditionally suppresses logs based on the environment (e.g., `import.meta.env.DEV`). Avoid logging full data structures even in development if they contain PII.

## 2026-02-05 - [Secure Handling of Private Storage Assets]
**Vulnerability:** User identification documents were being uploaded to a public storage bucket and accessed via static public URLs, bypassing access controls for sensitive PII.
**Learning:** Storing PII in public buckets, even with randomized filenames, is insufficient for security. Private buckets with RLS are required, but they also necessitate a frontend mechanism to handle signed URL generation.
**Prevention:** Always store PII in private buckets. Use a reusable `useSecureUrl` hook and `SecureImage` component to manage time-limited signed URLs, ensuring that only authorized users (owners and admins) can view the assets. Store relative storage paths (e.g., 'folder/file.ext') in the database to facilitate secure URL generation.
