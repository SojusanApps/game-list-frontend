/**
 * Turn submitted game-filter form data into request params: empty values are
 * dropped and dates become `YYYY-MM-DD`.
 */
export function cleanGameFilters(data: Record<string, unknown>): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      continue;
    }
    filters[key] = value instanceof Date ? value.toISOString().split("T")[0] : value;
  }
  return filters;
}
