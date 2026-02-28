/**
 * Convert Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Latin (0123456789)
 * and strip non-digit characters.
 */
export function normalizeDigits(text: string): string {
  const latinized = text.replace(/[٠-٩]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030)
  );
  return latinized.replace(/[^0-9]/g, '');
}
