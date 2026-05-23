/**
 * Centralized Frontend Validation Utilities
 * All validation rules match the backend for consistency.
 */

// ─── REGEX PATTERNS ───────────────────────────────────────────
export const PATTERNS = {
  phone: /^(\+91[\-\s]?)?[6-9]\d{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  aadhaar: /^[2-9]\d{11}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  pincode: /^[1-9]\d{5}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
};

// ─── ERROR MESSAGES ───────────────────────────────────────────
export const ERRORS = {
  phone: "Invalid phone number. Must be 10 digits starting with 6-9",
  email: "Invalid email format",
  aadhaar: "Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1",
  pan: "Invalid PAN format. Must be like ABCDE1234F",
  pincode: "Invalid PIN code. Must be 6 digits and cannot start with 0",
  objectId: "Invalid ID format (must be 24 characters)",
  passwordMin: "Password must be at least 6 characters",
  passwordMax: "Password must not exceed 100 characters",
  passwordUpper: "Password must contain at least 1 uppercase letter",
  passwordLower: "Password must contain at least 1 lowercase letter",
  passwordDigit: "Password must contain at least 1 digit",
  emailMax: "Email must not exceed 254 characters",
  fileType: "Invalid file type",
  fileSize: "File size exceeds the maximum allowed",
  required: "This field is required",
};

// ─── VALIDATORS ───────────────────────────────────────────────

/**
 * Validate phone number
 * Accepts: 9876543210, +919876543210, +91-9876543210, +91 9876543210
 */
export function validatePhone(value) {
  if (!value || !value.trim()) return null; // optional unless required
  const cleaned = value.trim();
  if (!PATTERNS.phone.test(cleaned)) return ERRORS.phone;
  return null;
}

/**
 * Validate email
 */
export function validateEmail(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim().toLowerCase();
  if (cleaned.length > 254) return ERRORS.emailMax;
  if (!PATTERNS.email.test(cleaned)) return ERRORS.email;
  return null;
}

/**
 * Validate Aadhaar number
 * Exactly 12 digits, cannot start with 0 or 1
 * Strips spaces and dashes automatically
 */
export function validateAadhaar(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.replace(/[\s\-]/g, "");
  if (!PATTERNS.aadhaar.test(cleaned)) return ERRORS.aadhaar;
  return null;
}

/**
 * Validate PAN number
 * Format: ABCDE1234F
 */
export function validatePAN(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim().toUpperCase();
  if (!PATTERNS.pan.test(cleaned)) return ERRORS.pan;
  return null;
}

/**
 * Validate Pincode
 * Exactly 6 digits, cannot start with 0
 */
export function validatePincode(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim();
  if (!PATTERNS.pincode.test(cleaned)) return ERRORS.pincode;
  return null;
}

/**
 * Validate Password
 * Min 6, Max 100, at least 1 uppercase, 1 lowercase, 1 digit
 */
export function validatePassword(value) {
  if (!value) return ERRORS.passwordMin;
  if (value.length < 6) return ERRORS.passwordMin;
  if (value.length > 100) return ERRORS.passwordMax;
  if (!/[A-Z]/.test(value)) return ERRORS.passwordUpper;
  if (!/[a-z]/.test(value)) return ERRORS.passwordLower;
  if (!/\d/.test(value)) return ERRORS.passwordDigit;
  return null;
}

/**
 * Validate MongoDB ObjectId
 * Must be exactly 24 hex characters
 */
export function validateObjectId(value) {
  if (!value || !value.trim()) return null;
  if (!PATTERNS.objectId.test(value.trim())) return ERRORS.objectId;
  return null;
}

/**
 * Validate file upload
 * @param {File} file - The file to validate
 * @param {Object} options - { allowedTypes: ['.pdf', '.docx'], maxSizeMB: 5 }
 */
export function validateFile(file, options = {}) {
  if (!file) return null;
  const { allowedTypes = [], maxSizeMB = 5 } = options;

  if (allowedTypes.length > 0) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return `${ERRORS.fileType}. Allowed: ${allowedTypes.join(", ")}`;
    }
  }

  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `${ERRORS.fileSize} (max ${maxSizeMB}MB)`;
  }

  return null;
}

/**
 * Validate multiple files
 */
export function validateFiles(files, options = {}) {
  const { maxCount = 100, ...fileOptions } = options;
  if (files.length > maxCount) {
    return `Maximum ${maxCount} files allowed`;
  }
  for (const file of files) {
    const err = validateFile(file, fileOptions);
    if (err) return `${file.name}: ${err}`;
  }
  return null;
}

// ─── SANITIZERS ───────────────────────────────────────────────

/** Strip spaces/dashes from Aadhaar and return digits only */
export function sanitizeAadhaar(value) {
  return (value || "").replace(/[\s\-]/g, "");
}

/** Auto-uppercase PAN */
export function sanitizePAN(value) {
  return (value || "").toUpperCase().trim();
}

/** Lowercase email */
export function sanitizeEmail(value) {
  return (value || "").toLowerCase().trim();
}

/** Strip non-digits from phone, keep +91 prefix if present */
export function sanitizePhone(value) {
  if (!value) return "";
  const trimmed = value.trim();
  // If starts with +91, keep it
  if (trimmed.startsWith("+91")) {
    return "+91" + trimmed.slice(3).replace(/\D/g, "");
  }
  return trimmed.replace(/\D/g, "").slice(0, 10);
}

// ─── FORM VALIDATOR ───────────────────────────────────────────

/**
 * Validate a full form object against a rules map.
 * @param {Object} formData - { phone: "123", email: "abc", ... }
 * @param {Object} rules - { phone: { required: true }, email: { required: true }, ... }
 * @returns {Object} errors - { phone: "error msg", email: "error msg" }
 */
export function validateForm(formData, rules) {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];

    // Required check
    if (rule.required && (!value || !String(value).trim())) {
      errors[field] = rule.label ? `${rule.label} is required` : ERRORS.required;
      continue;
    }

    // Skip validation if empty and not required
    if (!value || !String(value).trim()) continue;

    // Type-specific validation
    let err = null;
    switch (rule.type) {
      case "phone":
        err = validatePhone(value);
        break;
      case "email":
        err = validateEmail(value);
        break;
      case "aadhaar":
        err = validateAadhaar(value);
        break;
      case "pan":
        err = validatePAN(value);
        break;
      case "pincode":
        err = validatePincode(value);
        break;
      case "password":
        err = validatePassword(value);
        break;
      case "objectId":
        err = validateObjectId(value);
        break;
      default:
        break;
    }

    if (err) errors[field] = err;
  }

  return errors;
}

// ─── FILE UPLOAD PRESETS ──────────────────────────────────────

export const FILE_PRESETS = {
  resume: { allowedTypes: [".pdf", ".docx", ".doc"], maxSizeMB: 5 },
  jd: { allowedTypes: [".pdf", ".docx", ".txt"], maxSizeMB: 5 },
  document: { allowedTypes: [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"], maxSizeMB: 5 },
  csv: { allowedTypes: [".csv"], maxSizeMB: 10 },
};
