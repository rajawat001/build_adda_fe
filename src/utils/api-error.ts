/**
 * Extract a human-readable error message from an API error response.
 *
 * Backend responses may use different field names:
 *   - error middleware  → { success: false, error: "..." }
 *   - role middleware   → { message: "..." }
 *   - validation errors → { validationErrors: [...] }
 *
 * This helper checks all common fields so every catch-block
 * shows the real server message instead of a generic fallback.
 */
export function getApiErrorMessage(
  err: any,
  fallback: string = 'Something went wrong. Please try again.'
): string {
  if (err?.response?.data) {
    const data = err.response.data;

    // Check validation errors array first
    if (Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
      return data.validationErrors.map((v: any) => v.message || v.msg).filter(Boolean).join('. ') || fallback;
    }

    // data.error can be a string or an object { code, message, details }
    const errorField = data.error;
    const errorMsg = typeof errorField === 'object' && errorField !== null ? errorField.message : errorField;
    return data.message || errorMsg || data.msg || fallback;
  }

  return err?.message || fallback;
}

/**
 * Scroll the first visible error message into view.
 * Call this after setting an error state so the user sees it.
 */
export function scrollToError(selector: string = '.error-message'): void {
  setTimeout(() => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 120);
}
