/**
 * Tests for common Zod schemas
 */

import { describe, it, expect } from "vitest";
import {
  uuidSchema,
  urlSchema,
  ipSchema,
  portSchema,
  domainSchema,
  emailSchema,
  slugSchema,
  nameSchema,
  paginationSchema,
  errorResponseSchema,
} from "./common";

describe("Common Schemas", () => {
  describe("UUID Schema", () => {
    it("should accept valid UUID v4", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(() => uuidSchema.parse(uuid)).not.toThrow();
    });

    it("should reject invalid UUID", () => {
      expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
      expect(() => uuidSchema.parse("12345")).toThrow();
    });
  });

  describe("URL Schema", () => {
    it("should accept valid URLs", () => {
      expect(() => urlSchema.parse("https://example.com")).not.toThrow();
      expect(() => urlSchema.parse("http://localhost:3000")).not.toThrow();
      expect(() => urlSchema.parse("https://coolify.example.com/api/v1")).not.toThrow();
    });

    it("should reject invalid URLs", () => {
      expect(() => urlSchema.parse("not a url")).toThrow();
      expect(() => urlSchema.parse("example.com")).toThrow();
    });
  });

  describe("IP Schema", () => {
    it("should accept valid IPv4", () => {
      expect(() => ipSchema.parse("192.168.1.1")).not.toThrow();
      expect(() => ipSchema.parse("127.0.0.1")).not.toThrow();
      expect(() => ipSchema.parse("0.0.0.0")).not.toThrow();
    });

    it("should accept valid IPv6", () => {
      expect(() => ipSchema.parse("::1")).not.toThrow();
      expect(() => ipSchema.parse("2001:db8::1")).not.toThrow();
    });

    it("should reject invalid IP", () => {
      expect(() => ipSchema.parse("256.256.256.256")).toThrow();
      expect(() => ipSchema.parse("not-an-ip")).toThrow();
    });
  });

  describe("Port Schema", () => {
    it("should accept valid ports", () => {
      expect(() => portSchema.parse(80)).not.toThrow();
      expect(() => portSchema.parse(443)).not.toThrow();
      expect(() => portSchema.parse(3000)).not.toThrow();
      expect(() => portSchema.parse(65535)).not.toThrow();
    });

    it("should reject invalid ports", () => {
      expect(() => portSchema.parse(0)).toThrow();
      expect(() => portSchema.parse(65536)).toThrow();
      expect(() => portSchema.parse(-1)).toThrow();
      expect(() => portSchema.parse(3.5)).toThrow();
    });
  });

  describe("Domain Schema", () => {
    it("should accept valid domains", () => {
      expect(() => domainSchema.parse("example.com")).not.toThrow();
      expect(() => domainSchema.parse("sub.example.com")).not.toThrow();
      expect(() => domainSchema.parse("coolify.example.com")).not.toThrow();
    });

    it("should reject invalid domains", () => {
      expect(() => domainSchema.parse("")).toThrow();
      expect(() => domainSchema.parse("not domain")).toThrow();
    });
  });

  describe("Email Schema", () => {
    it("should accept valid emails", () => {
      expect(() => emailSchema.parse("user@example.com")).not.toThrow();
      expect(() => emailSchema.parse("test.user+tag@example.co.uk")).not.toThrow();
    });

    it("should reject invalid emails", () => {
      expect(() => emailSchema.parse("not-an-email")).toThrow();
      expect(() => emailSchema.parse("@example.com")).toThrow();
      expect(() => emailSchema.parse("user@")).toThrow();
    });
  });

  describe("Slug Schema", () => {
    it("should accept valid slugs", () => {
      expect(() => slugSchema.parse("my-project")).not.toThrow();
      expect(() => slugSchema.parse("api-v1")).not.toThrow();
      expect(() => slugSchema.parse("123")).not.toThrow();
    });

    it("should reject invalid slugs", () => {
      expect(() => slugSchema.parse("My Project")).toThrow(); // Uppercase
      expect(() => slugSchema.parse("my_project")).toThrow(); // Underscore
      expect(() => slugSchema.parse("")).toThrow(); // Empty
    });
  });

  describe("Name Schema", () => {
    it("should accept valid names", () => {
      expect(() => nameSchema.parse("My Project")).not.toThrow();
      expect(() => nameSchema.parse("api-server_v1")).not.toThrow();
      expect(() => nameSchema.parse("Production App")).not.toThrow();
    });

    it("should reject invalid names", () => {
      expect(() => nameSchema.parse("")).toThrow();
      expect(() => nameSchema.parse("My@Project")).toThrow(); // Special char
    });

    it("should enforce max length", () => {
      const longName = "a".repeat(256);
      expect(() => nameSchema.parse(longName)).toThrow();
    });
  });

  describe("Pagination Schema", () => {
    it("should accept valid pagination", () => {
      const result = paginationSchema.parse({
        limit: 20,
        offset: 0,
      });

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it("should use defaults", () => {
      const result = paginationSchema.parse({});

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it("should enforce constraints", () => {
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
      expect(() => paginationSchema.parse({ offset: -1 })).toThrow();
    });
  });

  describe("Error Response Schema", () => {
    it("should accept valid error response", () => {
      const response = errorResponseSchema.parse({
        error: "VALIDATION_ERROR",
        message: "Invalid parameter",
        hint: "Check parameter type",
      });

      expect(response.error).toBe("VALIDATION_ERROR");
      expect(response.message).toBe("Invalid parameter");
    });

    it("should allow optional fields", () => {
      const response = errorResponseSchema.parse({
        error: "NOT_FOUND",
        message: "Resource not found",
      });

      expect(response.details).toBeUndefined();
      expect(response.hint).toBeUndefined();
    });
  });
});
