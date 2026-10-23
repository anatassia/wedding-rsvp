export function isNonEmptyString(value, maxLength = 200) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

// Malaysian mobile/landline numbers in any common written form:
// 012-345 6789, 0123456789, 03-1234 5678, +60123456789, 60123456789.
// Permissive about separators, strict about digit count (7-11 digits).
export function isValidPhone(value) {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 9 && digits.length <= 12 && /^[0-9+\-()\s]+$/.test(value.trim());
}

export function isValidPartySize(value) {
  return Number.isInteger(value) && value >= 1 && value <= 3;
}

export function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export function isValidReferenceCode(value) {
  return typeof value === "string" && /^[A-Za-z0-9]{6,10}$/.test(value.trim());
}

export function sanitizeCompanionNames(value) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 500);
}

export function sanitizeNotes(value) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 500);
}

// Prevents CSV formula injection (Excel/Sheets execute a leading
// =, +, -, @, tab or CR as a formula). Prefixing with an apostrophe
// neutralizes it while keeping the value human-readable.
export function csvSafeCell(value) {
  const text = value == null ? "" : String(value);
  const needsGuard = /^[=+\-@\t\r]/.test(text);
  const escaped = text.replace(/"/g, '""');
  const guarded = needsGuard ? `'${escaped}` : escaped;
  return `"${guarded}"`;
}
