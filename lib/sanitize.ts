/**
 * Sanitize user input to prevent XSS and HTML injection.
 * Strips all HTML tags and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, '')    // Remove any remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers like onclick=
    .replace(/data:/gi, '')  // Remove data: protocol
    .trim();
}
