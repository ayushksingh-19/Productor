function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function toDisplayName(identifier) {
  if (!identifier) {
    return "Orufy Admin";
  }

  const rawName = identifier.includes("@")
    ? identifier.split("@")[0]
    : identifier.replace(/\D/g, "").slice(-4);

  if (!rawName) {
    return "Orufy Admin";
  }

  return rawName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeIdentifier(identifier) {
  return String(identifier || "").trim().toLowerCase();
}

function isValidIdentifier(identifier) {
  const value = normalizeIdentifier(identifier);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[0-9]{10,15}$/;
  return emailPattern.test(value) || phonePattern.test(value);
}

function toRelativeUploadPath(fileName) {
  return `/uploads/${fileName}`;
}

module.exports = {
  createHttpError,
  isValidIdentifier,
  normalizeIdentifier,
  toDisplayName,
  toRelativeUploadPath,
};
