/**
 * Tests for READ_ONLY mode safety guardrail
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  isDestructiveOperation,
  guardReadOnly,
  getOperationCategory,
} from "./readonly-guard";
import { ReadOnlyError } from "../errors/error-types";
import { initializeLogger } from "../logging/logger.server";

describe("READ_ONLY Guard", () => {
  let logger: any;

  beforeEach(() => {
    logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
  });

  describe("isDestructiveOperation", () => {
    it("should identify delete operations as destructive", () => {
      expect(isDestructiveOperation("delete_team")).toBe(true);
      expect(isDestructiveOperation("delete_project")).toBe(true);
      expect(isDestructiveOperation("delete_application")).toBe(true);
    });

    it("should identify create operations as destructive", () => {
      expect(isDestructiveOperation("create_team")).toBe(true);
      expect(isDestructiveOperation("create_project")).toBe(true);
    });

    it("should identify lifecycle operations as destructive", () => {
      expect(isDestructiveOperation("start_application")).toBe(true);
      expect(isDestructiveOperation("stop_application")).toBe(true);
      expect(isDestructiveOperation("restart_application")).toBe(true);
    });

    it("should identify server operations as destructive", () => {
      expect(isDestructiveOperation("install_docker")).toBe(true);
      expect(isDestructiveOperation("cleanup_server")).toBe(true);
    });

    it("should NOT identify read operations as destructive", () => {
      expect(isDestructiveOperation("list_teams")).toBe(false);
      expect(isDestructiveOperation("get_team")).toBe(false);
      expect(isDestructiveOperation("list_applications")).toBe(false);
      expect(isDestructiveOperation("get_application")).toBe(false);
    });
  });

  describe("guardReadOnly", () => {
    it("should allow destructive operations when READ_ONLY is false", () => {
      expect(() => {
        guardReadOnly("delete_team", false, logger);
      }).not.toThrow();

      expect(() => {
        guardReadOnly("create_application", false, logger);
      }).not.toThrow();
    });

    it("should allow read operations when READ_ONLY is true", () => {
      expect(() => {
        guardReadOnly("list_teams", true, logger);
      }).not.toThrow();

      expect(() => {
        guardReadOnly("get_application", true, logger);
      }).not.toThrow();
    });

    it("should block destructive operations when READ_ONLY is true", () => {
      expect(() => {
        guardReadOnly("delete_team", true, logger);
      }).toThrow(ReadOnlyError);

      expect(() => {
        guardReadOnly("create_application", true, logger);
      }).toThrow(ReadOnlyError);

      expect(() => {
        guardReadOnly("restart_application", true, logger);
      }).toThrow(ReadOnlyError);
    });

    it("should include operation name in error", () => {
      try {
        guardReadOnly("delete_team", true, logger);
        expect.fail("Should have thrown");
      } catch (error) {
        if (error instanceof ReadOnlyError) {
          expect(error.operation).toBe("delete_team");
        } else {
          expect.fail("Wrong error type");
        }
      }
    });
  });

  describe("getOperationCategory", () => {
    it("should categorize delete operations as dangerous", () => {
      expect(getOperationCategory("delete_team")).toBe("dangerous");
      expect(getOperationCategory("cleanup_server")).toBe("dangerous");
    });

    it("should categorize lifecycle operations correctly", () => {
      expect(getOperationCategory("start_application")).toBe("lifecycle");
      expect(getOperationCategory("stop_application")).toBe("lifecycle");
      expect(getOperationCategory("restart_application")).toBe("lifecycle");
    });

    it("should categorize create/update operations as write", () => {
      expect(getOperationCategory("create_team")).toBe("write");
      expect(getOperationCategory("update_team")).toBe("write");
      expect(getOperationCategory("add_team_member")).toBe("write");
    });

    it("should categorize read operations as read", () => {
      expect(getOperationCategory("list_teams")).toBe("read");
      expect(getOperationCategory("get_team")).toBe("read");
      expect(getOperationCategory("unknown_operation")).toBe("read");
    });
  });
});
