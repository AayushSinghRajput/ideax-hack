/**
 * Convert English digits to Nepali digits
 * @param {number|string} num - The number to convert
 * @returns {string} - Nepali number as string
 */
export const toNepaliNumber = (num) => {
  if (num === null || num === undefined) return '';
  const enDigits = String(num).split('');
  const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
  return enDigits.map(d => {
    if (d >= '0' && d <= '9') return nepDigits[d];
    return d; // keep other characters like '.', ',' etc.
  }).join('');
};
