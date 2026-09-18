import { isISODate } from '../dates';
import type { CreateReportInput, UpdateReportInput } from '../models';
import { validateEmail, validatePhone } from './contact';
import { validateReportNumber } from './reportNumber';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function firstError(
  errors: Record<string, string>,
): ValidationResult {
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCreateReportInput(
  input: CreateReportInput,
): ValidationResult {
  const errors: Record<string, string> = {};

  const customerName = input.customerName?.trim() ?? '';
  if (!customerName) {
    errors.customerName = 'Customer or site name is required.';
  } else if (customerName.length > 200) {
    errors.customerName = 'Customer name is too long (max 200 characters).';
  }

  if (input.title !== undefined && input.title.trim().length > 200) {
    errors.title = 'Title is too long (max 200 characters).';
  }

  if (input.reportDate !== undefined && !isISODate(input.reportDate)) {
    errors.reportDate = 'Report date must be YYYY-MM-DD.';
  }

  return firstError(errors);
}

export function validateUpdateReportInput(
  input: UpdateReportInput,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.customerName !== undefined) {
    const name = input.customerName.trim();
    if (!name) {
      errors.customerName = 'Customer or site name cannot be empty.';
    } else if (name.length > 200) {
      errors.customerName = 'Customer name is too long (max 200 characters).';
    }
  }

  if (input.title !== undefined && input.title.trim().length > 200) {
    errors.title = 'Title is too long (max 200 characters).';
  }

  if (input.reportDate !== undefined && !isISODate(input.reportDate)) {
    errors.reportDate = 'Report date must be YYYY-MM-DD.';
  }

  return firstError(errors);
}

export function validateReportNumberField(
  reportNumber: string,
): ValidationResult {
  const result = validateReportNumber(reportNumber);
  if (!result.valid) {
    return { valid: false, errors: { reportNumber: result.error ?? 'Invalid report number.' } };
  }
  return { valid: true, errors: {} };
}

export function validateBusinessProfileContact(
  email: string,
  phone: string,
): ValidationResult {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    errors.email = emailResult.error ?? 'Invalid email.';
  }

  const phoneResult = validatePhone(phone);
  if (!phoneResult.valid) {
    errors.phone = phoneResult.error ?? 'Invalid phone.';
  }

  return firstError(errors);
}
