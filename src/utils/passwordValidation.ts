
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
 * Checks the strength of a password based on common security criteria.
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

/**
 * Validates a password against the application's security policy.
 * Returns an object with isValid boolean and an optional error message.
 */
export const validatePassword = (password: string): { isValid: boolean; message: string | null } => {
  const { checks } = checkPasswordStrength(password);

  if (!checks.length) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!checks.lowercase || !checks.uppercase || !checks.digit || !checks.symbol) {
    return { isValid: false, message: 'Include uppercase, lowercase, digit and symbol' };
  }

  return { isValid: true, message: null };
};

/**
 * Utility for password validation and strength checking
 */

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
 * Checks the strength of a password based on common security requirements
 * @param password The password string to check
 * @returns A PasswordStrength object containing detailed results
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

/**
 * Validates if a password meets the minimum security requirements
 * @param password The password string to validate
 * @returns boolean true if valid, false otherwise
 */
export const isPasswordStrong = (password: string): boolean => {
  const { checks } = checkPasswordStrength(password);
  return checks.lowercase && checks.uppercase && checks.digit && checks.symbol && checks.length;
};
