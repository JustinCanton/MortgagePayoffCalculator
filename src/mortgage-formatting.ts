import { getCurrency as getLocaleCurrency } from 'locale-currency';

export function getCurrency(): string {
  // Use locale-currency package to automatically detect currency from browser locale
  try {
    const currency = getLocaleCurrency(navigator.language);
    // If package returns a valid currency code, use it
    if (currency) return currency;
  } catch (error) {
    console.warn('Could not detect currency from locale:', error);
  }
  
  // Fallback to USD if detection fails
  return 'USD';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: getCurrency(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInputValue(value: number, allowDecimals: boolean = true): string {
  return new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: allowDecimals ? 2 : 0,
    useGrouping: true,
  }).format(value);
}

export function parseFormattedNumber(value: string, allowDecimals: boolean = true): number {
  if (!value || value.trim() === '') return 0;
  
  // Get the locale-specific decimal separator
  const decimalSeparator = (1.1).toLocaleString(navigator.language).charAt(1);
  
  // Remove all non-numeric characters except the decimal separator
  const cleaned = value.replace(new RegExp(`[^0-9${decimalSeparator.replace('.', '\\.')}]`, 'g'), '');
  
  // Replace locale decimal separator with period for parsing
  const normalized = cleaned.replace(decimalSeparator, '.');
  
  const parsed = Number.parseFloat(normalized);
  
  // Round to whole number if decimals not allowed
  const result = isNaN(parsed) ? 0 : (allowDecimals ? parsed : Math.round(parsed));
  
  return result;
}

export function formatYearsMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (years === 0) return `${months} month${months === 1 ? '' : 's'}`;
  if (months === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
}

export function formatTermTitle(termLength: number): string {
  return `Term Details (${termLength} Year${termLength === 1 ? '' : 's'})`;
}
