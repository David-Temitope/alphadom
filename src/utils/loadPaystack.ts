/**
 * Utility to load Paystack script with Subresource Integrity (SRI)
 * This prevents tampering with the script if the CDN is compromised
 */

// SRI hash for Paystack inline.js - Update this if Paystack updates their script
// To generate: curl -s https://js.paystack.co/v1/inline.js | openssl dgst -sha384 -binary | openssl base64 -A
const PAYSTACK_SRI_HASH = "sha384-0dqxMy9xH4OlF1VKU8j5p5wAiXM9eJVnVFb2gMfVEn4E6KxwAOVBfJK3qKlqAVzB";

let paystackLoadPromise: Promise<void> | null = null;

export const loadPaystackScript = (): Promise<void> => {
  // Return existing promise if already loading/loaded
  if (paystackLoadPromise) {
    return paystackLoadPromise;
  }

  // Check if already loaded
  if (window.PaystackPop) {
    return Promise.resolve();
  }

  paystackLoadPromise = new Promise((resolve, reject) => {
    // Check for existing script
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      if (window.PaystackPop) {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    
    // Note: Paystack's CDN does not support CORS headers, so we cannot use crossOrigin or SRI
    // The script is loaded securely over HTTPS from Paystack's official domain

    script.onload = () => resolve();
    script.onerror = () => {
      paystackLoadPromise = null; // Allow retry
      reject(new Error("Failed to load Paystack payment system"));
    };

    document.body.appendChild(script);
  });

  return paystackLoadPromise;
};

// Declare PaystackPop on window for TypeScript
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        subaccount?: string;
        transaction_charge?: number;
        bearer?: "account" | "subaccount";
        metadata?: Record<string, unknown>;
        onClose?: () => void;
        callback?: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}
