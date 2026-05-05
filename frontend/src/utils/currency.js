const safeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatINR = (value, options = {}) => {
  const amount = safeAmount(value);
  const hasDecimals = !Number.isInteger(amount);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

export const formatINRNumber = (value, options = {}) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    ...options,
  }).format(safeAmount(value));

export const formatCompactINR = (value, options = {}) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  }).format(safeAmount(value));
