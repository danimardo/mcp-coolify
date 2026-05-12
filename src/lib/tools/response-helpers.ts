/**
 * Helpers para normalizar respuestas de la API de Coolify.
 *
 * La API de Coolify es heterogénea: a veces devuelve un array directo,
 * otras un objeto que envuelve el array bajo una clave (`databases`, `servers`, ...).
 * Estos helpers permiten leer respuestas `unknown` de forma type-safe sin usar `any`.
 */

/** Type guard: el valor es un objeto plano (no array, no null). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Devuelve el valor como `Record<string, unknown>` o un objeto vacío. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

/**
 * Extrae un array de objetos de una respuesta de la API.
 * Acepta tanto un array directo como un objeto que lo envuelve bajo alguna de las `keys`.
 */
export function extractArray(
  response: unknown,
  ...keys: string[]
): Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response.filter(isRecord);
  }
  if (isRecord(response)) {
    for (const key of keys) {
      const inner = response[key];
      if (Array.isArray(inner)) {
        return inner.filter(isRecord);
      }
    }
  }
  return [];
}

/** Devuelve el valor si es string; en caso contrario `undefined`. */
export function asStringOpt(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Devuelve el valor si es string; en caso contrario el `fallback`. */
export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Devuelve el valor si es number; en caso contrario `undefined`. */
export function asNumberOpt(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Devuelve el valor si es number; en caso contrario el `fallback`. */
export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Devuelve el valor si es boolean; en caso contrario `undefined`. */
export function asBooleanOpt(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/** Devuelve un timestamp ISO 8601: el del valor si es string válido, si no `new Date().toISOString()`. */
export function asIsoDate(value: unknown): string {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      // Normaliza a ISO 8601 con milisegundos y zona UTC ("Z"), que es lo que exige z.string().datetime()
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}
