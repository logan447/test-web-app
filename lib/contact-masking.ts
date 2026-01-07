/**
 * Mask email address
 * Example: john.doe@example.com → j***@e***.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }

  const [local, domain] = email.split('@');
  const [domainName, tld] = domain.split('.');

  const maskedLocal = local.charAt(0) + '***';
  const maskedDomain = domain.charAt(0) + '***';

  return `${maskedLocal}@${maskedDomain}.${tld || '***'}`;
}

/**
 * Mask phone number
 * Example: (555) 123-4567 → (***) ***-4567
 */
export function maskPhone(phone: string | null): string {
  if (!phone) {
    return '(***) ***-****';
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length >= 4) {
    const lastFour = digits.slice(-4);
    return `(***) ***-${lastFour}`;
  }

  return '(***) ***-****';
}

/**
 * Mask name (show first name only)
 * Example: John Doe → John D.
 */
export function maskName(name: string): string {
  if (!name) {
    return '***';
  }

  const parts = name.trim().split(' ');

  if (parts.length === 1) {
    // Only first name, return it
    return parts[0];
  }

  // Return first name + first letter of last name
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);

  return `${firstName} ${lastInitial}.`;
}

/**
 * Check if contact info is masked (for UI purposes)
 */
export function isMaskedEmail(email: string): boolean {
  return email.includes('***');
}

export function isMaskedPhone(phone: string): boolean {
  return phone.includes('***');
}

export function isMaskedName(name: string): boolean {
  return name.includes('***') || name.match(/\s[A-Z]\.$/);
}

/**
 * Mask all contact information in an object
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone: string | null;
}

export interface MaskedContactInfo {
  name: string;
  email: string;
  phone: string;
  isMasked: true;
}

export function maskContactInfo(contact: ContactInfo): MaskedContactInfo {
  return {
    name: maskName(contact.name),
    email: maskEmail(contact.email),
    phone: maskPhone(contact.phone),
    isMasked: true,
  };
}
