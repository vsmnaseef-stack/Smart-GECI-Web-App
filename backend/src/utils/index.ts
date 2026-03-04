/**
 * Shared utility functions for Smart GECI backend.
 */

/**
 * Wraps any value in the standard success response envelope.
 */
export function successResponse<T>(data: T) {
  return { success: true as const, data };
}

/**
 * Parses a query-string integer with a fallback default.
 */
export function parseIntParam(
  value: string | undefined,
  defaultValue: number,
  min = 1,
  max = 1000,
): number {
  const parsed = parseInt(value ?? '', 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Returns pagination metadata given page, limit, and total count.
 */
export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Safely converts an unknown thrown value to a string message.
 */
export function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
