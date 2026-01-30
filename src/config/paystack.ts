/**
 * Paystack Configuration
 * This is the publishable key (pk_live_*) which is safe to include in client code.
 * It can only be used to initiate payments - it cannot access account details or make withdrawals.
 */
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
