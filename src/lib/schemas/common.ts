/**
 * Common Zod schemas used across all tools
 * Provides reusable validators for UUIDs, URLs, IPs, etc.
 */

import { z } from "zod";

/**
 * UUID v4 validator
 */
export const uuidSchema = z
  .string()
  .uuid("Invalid UUID format")
  .describe("UUID v4 identifier");

/**
 * Coolify resource identifier validator.
 * Coolify uses its own alphanumeric IDs (e.g. "b4wskogsggco0wk8kc4wscwk")
 * rather than standard UUIDs. Accepts both formats.
 */
export const coolifyIdSchema = z
  .string()
  .regex(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-z]{8,40})$/,
    "Invalid Coolify resource ID"
  )
  .describe("Coolify resource identifier");

/**
 * URL validator
 */
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .describe("Valid URL");

/**
 * IP address (v4 or v6) validator
 */
export const ipSchema = z
  .string()
  .ip("Invalid IP address")
  .describe("IPv4 or IPv6 address");

/**
 * Port number validator
 */
export const portSchema = z
  .number()
  .int("Port must be an integer")
  .min(1, "Port must be >= 1")
  .max(65535, "Port must be <= 65535")
  .describe("Network port (1-65535)");

/**
 * Domain name validator
 */
export const domainSchema = z
  .string()
  .min(1)
  .regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
    "Invalid domain name"
  )
  .describe("Domain name");

/**
 * Email address validator
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .describe("Valid email address");

/**
 * Unix timestamp validator
 */
export const timestampSchema = z
  .number()
  .int("Timestamp must be an integer")
  .min(0, "Timestamp must be non-negative")
  .describe("Unix timestamp (milliseconds)");

/**
 * ISO 8601 date string validator
 */
export const isoDateSchema = z
  .string()
  .datetime("Invalid ISO 8601 datetime")
  .describe("ISO 8601 datetime string");

/**
 * Slug validator (for URL-safe names)
 */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .describe("URL-safe slug");

/**
 * Generic name validator (alphanumeric, hyphens, underscores)
 */
export const nameSchema = z
  .string()
  .min(1, "Name cannot be empty")
  .max(255, "Name must be <= 255 characters")
  .regex(
    /^[a-zA-Z0-9_-\s]+$/,
    "Name can only contain letters, numbers, underscores, hyphens, and spaces"
  )
  .describe("Human-readable name");

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Items per page"),

  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Items to skip"),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Pagination response wrapper
 */
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema).describe("Array of items"),
    total: z.number().int().describe("Total number of items"),
    limit: z.number().int().describe("Items per page"),
    offset: z.number().int().describe("Items skipped"),
  });
}

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string().describe("Error code"),
  message: z.string().describe("Human-readable error message"),
  details: z.unknown().optional().describe("Additional error details"),
  hint: z.string().optional().describe("Actionable hint for resolution"),
  requestId: z.string().optional().describe("Request ID for correlation"),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Success response wrapper
 */
export function createSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        requestId: z.string(),
        timestamp: z.string().datetime(),
      })
      .optional(),
  });
}
