import type { z } from "zod";

/**
 * Wraps an object schema for a route's `validateSearch` so one bad or stale URL param is dropped instead of
 * failing the whole page: every field is validated on its own and invalid ones are omitted.
 */
export function lenientSearch<T extends z.ZodObject>(schema: T) {
  return (raw: Record<string, unknown>): z.infer<T> => {
    const parsed = schema.safeParse(raw);
    if (parsed.success) {
      return parsed.data;
    }
    const result: Record<string, unknown> = {};
    for (const [key, fieldSchema] of Object.entries(schema.shape)) {
      const field = (fieldSchema as z.ZodType).safeParse(raw[key]);
      if (field.success && field.data !== undefined) {
        result[key] = field.data;
      }
    }
    return result as z.infer<T>;
  };
}
