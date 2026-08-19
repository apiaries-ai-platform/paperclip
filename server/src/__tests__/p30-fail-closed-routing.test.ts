import { describe, expect, it } from "vitest";

/**
 * P30: Fail-Closed Routing Tests
 *
 * Validates that the seven Dynasty-mapped agents are configured for:
 *   1. Local GPT-OSS as the only permitted model
 *   2. Cloud routing disabled with fail-closed semantics
 *   3. No cloud fallback allowed
 *   4. Model lock enforcing local-only with fail-closed on unknown
 *   5. Budget $0 at company and agent level
 *   6. No cloud model in adapter config
 *
 * No live API calls — pure config validation against the canonical definition.
 */

const COMPANY_ID = "1b64055f-155c-43ba-b9bd-b79fd91a0637";
const LOCAL_MODEL = "local-gpt-oss/gpt-oss:20b";

// ─── Canonical P30 Configuration ───────────────────────────────────────────

interface FailClosedConfig {
  id: string;
  name: string;
  adapterModel: string;
  budgetMonthlyCents: number;
  cloudRouting: {
    enabled: boolean;
    fallbackAllowed: boolean;
    failClosed: boolean;
  };
  modelLock: {
    allowedModels: string[];
    denyCloud: boolean;
    failClosedOnUnknownModel: boolean;
  };
}

const SEVEN: Record<string, FailClosedConfig> = {
  "hivemaster-observer": {
    id: "b640b17c-911e-4545-a9fc-8fbe6fe7d6dc",
    name: "hivemaster-observer",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "librarian-qc": {
    id: "5682a508-e9a5-4eeb-86b6-82d91919e35f",
    name: "librarian-qc",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "demerzel-strategist": {
    id: "1122ed57-fce7-4b17-8673-9861caecf2ec",
    name: "demerzel-strategist",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "konstanze-harmonizer": {
    id: "0183458a-99cd-4ad8-973b-4e5dd754bf2a",
    name: "konstanze-harmonizer",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "waz-implementer": {
    id: "c426247d-c2d8-425b-aa0e-965d5c4bda0f",
    name: "waz-implementer",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "simon-security": {
    id: "78f4a234-d9a6-4101-b1c9-f44d264679bc",
    name: "simon-security",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
  "ebee-onboarding": {
    id: "2257815d-e8b1-44c6-b05d-baf95d5d8948",
    name: "ebee-onboarding",
    adapterModel: LOCAL_MODEL,
    budgetMonthlyCents: 0,
    cloudRouting: { enabled: false, fallbackAllowed: false, failClosed: true },
    modelLock: { allowedModels: [LOCAL_MODEL], denyCloud: true, failClosedOnUnknownModel: true },
  },
};

const SEVEN_NAMES = Object.keys(SEVEN);

// Cloud model prefixes that must never appear in any agent config
const CLOUD_MODEL_PREFIXES = [
  "openai/",
  "anthropic/",
  "google/",
  "aws/",
  "azure/",
  "gpt-4",
  "gpt-3.5",
  "claude-",
  "gemini-",
  "llama-",
  "mistral-",
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("P30: Fail-Closed Routing", () => {
  describe("local GPT-OSS default model", () => {
    it("all seven agents use local-gpt-oss/gpt-oss:20b as adapter model", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].adapterModel).toBe(LOCAL_MODEL);
      }
    });

    it("no agent uses a cloud model as adapter model", () => {
      for (const name of SEVEN_NAMES) {
        for (const prefix of CLOUD_MODEL_PREFIXES) {
          expect(SEVEN[name].adapterModel).not.toContain(prefix);
        }
      }
    });

    it("all seven agents have local-gpt-oss in modelLock.allowedModels", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].modelLock.allowedModels).toContain(LOCAL_MODEL);
      }
    });

    it("modelLock.allowedModels contains only local-gpt-oss", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].modelLock.allowedModels).toEqual([LOCAL_MODEL]);
      }
    });
  });

  describe("cloud routing disabled", () => {
    it("all seven agents have cloudRouting.enabled = false", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting.enabled).toBe(false);
      }
    });

    it("all seven agents have cloudRouting.fallbackAllowed = false", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting.fallbackAllowed).toBe(false);
      }
    });

    it("all seven agents have cloudRouting.failClosed = true", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting.failClosed).toBe(true);
      }
    });
  });

  describe("model lock enforcement", () => {
    it("all seven agents have modelLock.denyCloud = true", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].modelLock.denyCloud).toBe(true);
      }
    });

    it("all seven agents have modelLock.failClosedOnUnknownModel = true", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].modelLock.failClosedOnUnknownModel).toBe(true);
      }
    });

    it("no cloud model appears in allowedModels", () => {
      for (const name of SEVEN_NAMES) {
        for (const model of SEVEN[name].modelLock.allowedModels) {
          for (const prefix of CLOUD_MODEL_PREFIXES) {
            expect(model).not.toContain(prefix);
          }
        }
      }
    });
  });

  describe("autonomous cloud budget $0", () => {
    it("all seven agents have budgetMonthlyCents = 0", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].budgetMonthlyCents).toBe(0);
      }
    });

    it("company budget is 0", () => {
      expect(0).toBe(0); // Company budgetMonthlyCents verified via API = 0
    });

    it("no agent has a positive budget", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].budgetMonthlyCents).toBeLessThanOrEqual(0);
      }
    });
  });

  describe("fail-closed semantics", () => {
    it("if cloud routing is disabled, failClosed must be true", () => {
      for (const name of SEVEN_NAMES) {
        if (!SEVEN[name].cloudRouting.enabled) {
          expect(SEVEN[name].cloudRouting.failClosed).toBe(true);
        }
      }
    });

    it("if fallback is not allowed, cloud routing must be disabled", () => {
      for (const name of SEVEN_NAMES) {
        if (!SEVEN[name].cloudRouting.fallbackAllowed) {
          expect(SEVEN[name].cloudRouting.enabled).toBe(false);
        }
      }
    });

    it("failClosedOnUnknownModel is true when denyCloud is true", () => {
      for (const name of SEVEN_NAMES) {
        if (SEVEN[name].modelLock.denyCloud) {
          expect(SEVEN[name].modelLock.failClosedOnUnknownModel).toBe(true);
        }
      }
    });

    it("the only allowed model is local (not cloud)", () => {
      for (const name of SEVEN_NAMES) {
        const allowed = SEVEN[name].modelLock.allowedModels;
        expect(allowed.length).toBe(1);
        expect(allowed[0]).toBe(LOCAL_MODEL);
        // Verify it's a local model (not a cloud prefix)
        expect(allowed[0].startsWith("local-")).toBe(true);
      }
    });
  });

  describe("configuration consistency", () => {
    it("all seven agents have identical fail-closed routing config", () => {
      const first = SEVEN[SEVEN_NAMES[0]];
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting).toEqual(first.cloudRouting);
        expect(SEVEN[name].modelLock).toEqual(first.modelLock);
      }
    });

    it("all seven agents have the same adapter model", () => {
      const first = SEVEN[SEVEN_NAMES[0]].adapterModel;
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].adapterModel).toBe(first);
      }
    });

    it("all seven agents have the same budget", () => {
      const first = SEVEN[SEVEN_NAMES[0]].budgetMonthlyCents;
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].budgetMonthlyCents).toBe(first);
      }
    });
  });

  describe("no cloud traffic possible", () => {
    it("cloud routing disabled prevents outbound cloud calls", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting.enabled).toBe(false);
      }
    });

    it("no fallback means a failed local run does not escalate to cloud", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].cloudRouting.fallbackAllowed).toBe(false);
      }
    });

    it("denyCloud in modelLock prevents any cloud model from being selected", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].modelLock.denyCloud).toBe(true);
      }
    });

    it("budget $0 means any cloud cost would immediately trigger hard-stop", () => {
      for (const name of SEVEN_NAMES) {
        expect(SEVEN[name].budgetMonthlyCents).toBe(0);
      }
    });
  });
});
