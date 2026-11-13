import { AbstractControl, ValidationErrors } from '@angular/forms';

/** 8+ chars with upper, lower, digit and a special character. */
export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { weakPassword: true };
}

/** Form-group validator: newPassword must equal confirmPassword. */
export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { mismatch: true } : null;
}