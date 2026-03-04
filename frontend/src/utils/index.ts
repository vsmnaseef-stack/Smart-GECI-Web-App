/**
 * General-purpose utilities for Smart GECI frontend.
 * Add shared helper functions here.
 */

/**
 * Formats a coordinate value to a fixed number of decimal places.
 */
export function formatCoordinate(value: number, decimals = 5): string {
  return value.toFixed(decimals);
}

/**
 * Converts a snake_case or camelCase key to a human-readable label.
 */
export function keyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Type-safe object entries with correct key typing.
 */
export function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
