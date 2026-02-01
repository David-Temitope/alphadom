
export interface PasswordStrength {
  checks: {
    lowercase: boolean;
    uppercase: boolean;
    digit: boolean;
    symbol: boolean;
    length: boolean;
  };
  strength: number;
  label: string;
  color: string;
}

/**
 * Checks the strength of a password based on multiple criteria.
 * Enforces security by requiring a mix of character types and minimum length.
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    length: password.length >= 8,
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = (passedChecks / 5) * 100;

  let label = 'Very Weak';
  let color = 'bg-destructive';

  if (strength >= 100) {
    label = 'Strong';
    color = 'bg-primary';
  } else if (strength >= 80) {
    label = 'Good';
    color = 'bg-emerald-500';
  } else if (strength >= 60) {
    label = 'Fair';
    color = 'bg-yellow-500';
  } else if (strength >= 40) {
    label = 'Weak';
    color = 'bg-orange-500';
  }

  return { checks, strength, label, color };
};
