const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const detectIdentifierType = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return { type: null, error: 'Email or mobile number is required.' };

  if (value.includes('@')) {
    if (!EMAIL_REGEX.test(value.toLowerCase())) {
      return { type: null, error: 'Please enter a valid email address.' };
    }
    return { type: 'email', value: value.toLowerCase(), label: 'Email' };
  }

  const digits = value.replace(/\D/g, '');
  const mobile =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith('91')
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith('0')
          ? digits.slice(1)
          : null;

  if (!mobile || !MOBILE_REGEX.test(mobile)) {
    return { type: null, error: 'Please enter a valid 10-digit mobile number.' };
  }

  return { type: 'mobile', value: mobile, label: 'Mobile' };
};
