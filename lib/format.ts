/**
 * Format a number as price with dot separators (e.g. 25.000).
 * Uses a deterministic approach to avoid SSR/client hydration mismatch.
 */
export function formatPrice(n: number): string {
  const str = Math.round(n).toString()
  let result = ""
  let count = 0
  for (let i = str.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result = "." + result
    }
    result = str[i] + result
    count++
  }
  return result
}
