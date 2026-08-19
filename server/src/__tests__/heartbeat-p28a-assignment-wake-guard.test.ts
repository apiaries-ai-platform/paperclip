import { describe, expect, it } from "vitest";
import { shouldSuppressWakeupForOneShotMode } from "../services/heartbeat.ts";

describe("P28A: assignment-wakeup one-shot guard", () => {
  describe("child creation assigned to one_shot agent", () => {
    it("suppresses assignment wake when child is created assigned to one_shot agent (agent actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "agent",
        source: "assignment",
      })).toBe(true);
    });

    it("suppresses assignment wake when child is created assigned to one_shot agent (user actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "assignment",
      })).toBe(true);
    });
  });

  describe("later assignment to one_shot agent", () => {
    it("suppresses assignment wake when issue is later assigned to one_shot agent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "assignment",
      })).toBe(true);
    });

    it("suppresses assignment wake when issue is later assigned to one_shot agent (system actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "system",
        source: "assignment",
      })).toBe(true);
    });
  });

  describe("reassignment to one_shot agent", () => {
    it("suppresses reassignment wake for one_shot agent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "assignment",
      })).toBe(true);
    });
  });

  describe("normal-agent assignment wake", () => {
    it("does not suppress assignment wake for non-one_shot agents", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "continuous" },
        requestedByActorType: "user",
        source: "assignment",
      })).toBe(false);
    });

    it("does not suppress assignment wake when executionMode is absent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: {},
        requestedByActorType: "user",
        source: "assignment",
      })).toBe(false);
    });
  });

  describe("manual user wake", () => {
    it("allows manual on_demand wake by user for one_shot agent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "on_demand",
      })).toBe(false);
    });

    it("allows manual on_demand wake by system for one_shot agent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "system",
        source: "on_demand",
      })).toBe(false);
    });

    it("allows manual on_demand wake by agent for one_shot agent", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "agent",
        source: "on_demand",
      })).toBe(false);
    });
  });

  describe("automation/system wake suppression", () => {
    it("suppresses automation wake for one_shot agent (system actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "system",
        source: "automation",
      })).toBe(true);
    });

    it("suppresses automation wake for one_shot agent (agent actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "agent",
        source: "automation",
      })).toBe(true);
    });

    it("suppresses comment-triggered automation wake for one_shot agent (user actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "automation",
      })).toBe(true);
    });

    it("suppresses timer wake for one_shot agent (user actor)", () => {
      expect(shouldSuppressWakeupForOneShotMode({
        runtimeConfig: { executionMode: "one_shot" },
        requestedByActorType: "user",
        source: "timer",
      })).toBe(true);
    });
  });

  describe("zero duplicate runs", () => {
    it("suppresses all non-on_demand sources so no duplicate runs can be created", () => {
      const sources = ["automation", "assignment", "timer"];
      for (const source of sources) {
        for (const actor of ["user", "agent", "system"] as const) {
          expect(shouldSuppressWakeupForOneShotMode({
            runtimeConfig: { executionMode: "one_shot" },
            requestedByActorType: actor,
            source,
          })).toBe(true);
        }
      }
    });

    it("allows only on_demand source through for one_shot agents", () => {
      for (const actor of ["user", "agent", "system"] as const) {
        expect(shouldSuppressWakeupForOneShotMode({
          runtimeConfig: { executionMode: "one_shot" },
          requestedByActorType: actor,
          source: "on_demand",
        })).toBe(false);
      }
    });
  });
});
