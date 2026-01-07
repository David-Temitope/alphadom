# Security Headers Configuration Guide

This document outlines the security headers that must be configured at the hosting/CDN level (Cloudflare, Vercel, Netlify, etc.) for production deployment.

## Required HTTP Response Headers

These headers **cannot be set via HTML meta tags** and must be configured on your server or CDN:

### 1. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Forces HTTPS connections for 1 year.

### 2. X-Frame-Options
```
X-Frame-Options: DENY
```
Prevents clickjacking by blocking iframe embedding.
**Note:** Also set via CSP `frame-ancestors 'none'` which is the modern replacement.

### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Prevents MIME-sniffing attacks.

### 4. Content-Security-Policy
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://checkout.paystack.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

### 5. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
```

## Cloudflare Configuration

### Via Cloudflare Dashboard (Transform Rules):
1. Go to **Rules** → **Transform Rules** → **Modify Response Header**
2. Add the headers above as static values

### Via Cloudflare Workers:
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)')
  
  return newResponse
}
```

## CORS Configuration

The OWASP ZAP finding about CORS is related to **Supabase API responses**, not your frontend. Supabase allows cross-origin requests by design for API access.

**For your own API endpoints (if any)**, ensure:
```
Access-Control-Allow-Origin: https://alphadom.online
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Cookie SameSite Attribute

The SameSite=None cookie warning is from **Supabase Auth cookies**. This is intentional for cross-origin authentication. Supabase handles cookie security appropriately.

## Timestamp Disclosure

The timestamp disclosure warning refers to Unix timestamps in responses. These are typically:
- API response timestamps (harmless)
- Cache headers (harmless)
- JWT token `iat`/`exp` claims (required for authentication)

No action needed unless timestamps reveal sensitive business logic timing.

## Additional Security Measures

1. **Enable Cloudflare's security features:**
   - Bot Fight Mode
   - Security Level: Medium or High
   - Browser Integrity Check: ON
   - Always Use HTTPS: ON

2. **SSL/TLS Settings:**
   - Minimum TLS Version: 1.2
   - Opportunistic Encryption: ON
   - TLS 1.3: ON

3. **WAF Rules:**
   - Enable Cloudflare Managed Rules
   - Enable OWASP Core Rule Set
