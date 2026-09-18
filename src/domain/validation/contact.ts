export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,20}$/;

export function validateEmail(
  email: string,
  required = false,
): FieldValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return required
      ? { valid: false, error: 'Email is required.' }
      : { valid: true };
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Enter a valid email address.' };
  }

  return { valid: true };
}

export function validatePhone(
  phone: string,
  required = false,
): FieldValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    return required
      ? { valid: false, error: 'Phone number is required.' }
      : { valid: true };
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || !PHONE_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Enter a valid phone number.' };
  }

  return { valid: true };
}
