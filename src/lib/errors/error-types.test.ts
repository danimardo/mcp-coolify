/**
 * Tests for error types
 */

import { describe, it, expect } from "vitest";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  ReadOnlyError,
  ServerError,
  TimeoutError,
  NetworkError,
} from "./error-types";

describe("Error Types", () => {
  describe("ValidationError", () => {
    it("should have correct properties", () => {
      const error = new ValidationError("Invalid UUID");
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid UUID");
    });

    it("should provide hint", () => {
      const error = new ValidationError("Test error");
      expect(error.hint).toBeDefined();
    });

    it("should convert to response", () => {
      const error = new ValidationError("Invalid input", { field: "error" });
      const response = error.toResponse();

      expect(response.error).toBe("VALIDATION_ERROR");
      expect(response.message).toBe("Invalid input");
      expect(response.hint).toBeDefined();
    });
  });

  describe("NotFoundError", () => {
    it("should have correct properties", () => {
      const error = new NotFoundError("Team not found", "Team", "team-123");
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe("NOT_FOUND");
      expect(error.resourceType).toBe("Team");
      expect(error.resourceId).toBe("team-123");
    });

    it("should generate hint with resource info", () => {
      const error = new NotFoundError("Not found", "Team", "team-123");
      expect(error.hint).toContain("Team");
      expect(error.hint).toContain("team-123");
    });
  });

  describe("UnauthorizedError", () => {
    it("should have correct properties", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe("UNAUTHORIZED");
      expect(error.hint).toContain("COOLIFY_TOKEN");
    });
  });

  describe("ForbiddenError", () => {
    it("should have correct properties", () => {
      const error = new ForbiddenError("No permission");
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe("FORBIDDEN");
      expect(error.hint).toBeDefined();
    });
  });

  describe("RateLimitError", () => {
    it("should have correct properties", () => {
      const error = new RateLimitError("Rate limit exceeded", 60);
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.retryAfter).toBe(60);
    });
  });

  describe("ReadOnlyError", () => {
    it("should have correct properties", () => {
      const error = new ReadOnlyError("Blocked", "delete_team");
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe("READ_ONLY_MODE");
      expect(error.operation).toBe("delete_team");
      expect(error.hint).toContain("READ_ONLY");
    });
  });

  describe("ServerError", () => {
    it("should have correct properties", () => {
      const error = new ServerError("Internal server error");
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe("SERVER_ERROR");
      expect(error.hint).toContain("Coolify");
    });
  });

  describe("TimeoutError", () => {
    it("should have correct properties", () => {
      const error = new TimeoutError("Request timeout");
      expect(error.statusCode).toBe(504);
      expect(error.errorCode).toBe("REQUEST_TIMEOUT");
    });
  });

  describe("NetworkError", () => {
    it("should have correct properties", () => {
      const error = new NetworkError("Connection refused");
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe("NETWORK_ERROR");
      expect(error.hint).toContain("COOLIFY_URL");
    });

    it("should store original error", () => {
      const originalError = new Error("Connection timeout");
      const error = new NetworkError("Network failed", originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe("toResponse", () => {
    it("should convert all errors to response format", () => {
      const errors = [
        new ValidationError("Test"),
        new NotFoundError("Test"),
        new UnauthorizedError("Test"),
        new ForbiddenError("Test"),
      ];

      for (const err of errors) {
        const response = err.toResponse();
        expect(response.error).toBeDefined();
        expect(response.message).toBeDefined();
      }
    });
  });
});
