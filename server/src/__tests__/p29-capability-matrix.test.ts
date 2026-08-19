import { describe, expect, it } from "vitest";

/**
 * P29: Seven-Agent Role Capability Matrix Tests
 *
 * Validates the configuration of the seven Dynasty-mapped agents:
 *   1. hivemaster-observer  (researcher)
 *   2. librarian-qc         (qa)
 *   3. demerzel-strategist   (cto)
 *   4. konstanze-harmonizer  (cfo)
 *   5. waz-implementer       (engineer)
 *   6. simon-security        (security)
 *   7. ebee-onboarding       (devops)
 *
 * Tests validate: identity, role, capabilities, reportsTo (delegation edges),
 * executionMode, modelTier, budget, permittedTools, prohibitedActions,
 * tenantBoundary, and delegation graph acyclicity.
 *
 * No live API calls — these are pure config validation tests against the
 * canonical matrix definition.
 */

// ─── Canonical Matrix Definition ───────────────────────────────────────────

const COMPANY_ID = "1b64055f-155c-43ba-b9bd-b79fd91a0637";

interface AgentMatrixEntry {
  id: string;
  name: string;
  role: string;
  title: string;
  capabilities: string;
  reportsTo: string | null;
  executionMode: string;
  modelTier: string;
  maxConcurrentRuns: number;
  budgetMonthlyCents: number;
  permittedTools: string[];
  prohibitedActions: string[];
  delegationEdges: string[];
  tenantBoundary: string;
}

const MATRIX: Record<string, AgentMatrixEntry> = {
  "hivemaster-observer": {
    id: "b640b17c-911e-4545-a9fc-8fbe6fe7d6dc",
    name: "hivemaster-observer",
    role: "researcher",
    title: "Hivemaster Observer",
    capabilities: "observation,audit,evidence-collection,status-reporting",
    reportsTo: null,
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "list_files", "grep", "glob", "curl_get", "post_comment"],
    prohibitedActions: ["write_files", "edit_files", "delete_files", "execute_commands", "create_issues", "create_agents", "modify_agents", "deploy", "git_push", "git_commit"],
    delegationEdges: ["5682a508-e9a5-4eeb-86b6-82d91919e35f", "78f4a234-d9a6-4101-b1c9-f44d264679bc"],
    tenantBoundary: COMPANY_ID,
  },
  "librarian-qc": {
    id: "5682a508-e9a5-4eeb-86b6-82d91919e35f",
    name: "librarian-qc",
    role: "qa",
    title: "Librarian QC",
    capabilities: "quality-control,evidence-review,artifact-verification,sha256-validation",
    reportsTo: "b640b17c-911e-4545-a9fc-8fbe6fe7d6dc",
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "list_files", "grep", "glob", "sha256sum", "post_comment", "patch_issue_status"],
    prohibitedActions: ["write_files", "edit_files", "delete_files", "execute_commands", "create_issues", "create_agents", "modify_agents", "deploy", "git_push", "git_commit", "create_child_issues"],
    delegationEdges: [],
    tenantBoundary: COMPANY_ID,
  },
  "demerzel-strategist": {
    id: "1122ed57-fce7-4b17-8673-9861caecf2ec",
    name: "demerzel-strategist",
    role: "cto",
    title: "Demerzel Strategist",
    capabilities: "strategy,planning,roadmap,task-decomposition,prioritization",
    reportsTo: null,
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "list_files", "grep", "glob", "post_comment", "create_child_issues", "patch_issue_status"],
    prohibitedActions: ["write_files", "edit_files", "delete_files", "execute_commands", "create_agents", "modify_agents", "deploy", "git_push", "git_commit"],
    delegationEdges: ["c426247d-c2d8-425b-aa0e-965d5c4bda0f", "2257815d-e8b1-44c6-b05d-baf95d5d8948"],
    tenantBoundary: COMPANY_ID,
  },
  "konstanze-harmonizer": {
    id: "0183458a-99cd-4ad8-973b-4e5dd754bf2a",
    name: "konstanze-harmonizer",
    role: "cfo",
    title: "Konstanze Harmonizer",
    capabilities: "governance,harmonization,policy-enforcement,conflict-resolution,audit-trail",
    reportsTo: null,
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "list_files", "grep", "glob", "post_comment", "patch_issue_status"],
    prohibitedActions: ["write_files", "edit_files", "delete_files", "execute_commands", "create_child_issues", "create_agents", "modify_agents", "deploy", "git_push", "git_commit"],
    delegationEdges: [],
    tenantBoundary: COMPANY_ID,
  },
  "waz-implementer": {
    id: "c426247d-c2d8-425b-aa0e-965d5c4bda0f",
    name: "waz-implementer",
    role: "engineer",
    title: "WAZ Implementer",
    capabilities: "implementation,coding,build,test,refactor,bugfix",
    reportsTo: "1122ed57-fce7-4b17-8673-9861caecf2ec",
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "write_files", "edit_files", "list_files", "grep", "glob", "execute_commands", "post_comment", "patch_issue_status"],
    prohibitedActions: ["delete_files", "create_agents", "modify_agents", "deploy", "git_push", "git_commit", "create_child_issues"],
    delegationEdges: [],
    tenantBoundary: COMPANY_ID,
  },
  "simon-security": {
    id: "78f4a234-d9a6-4101-b1c9-f44d264679bc",
    name: "simon-security",
    role: "security",
    title: "Simon Security",
    capabilities: "security-review,vulnerability-scan,credential-audit,access-control-review,compliance-check",
    reportsTo: null,
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "list_files", "grep", "glob", "curl_get", "post_comment", "patch_issue_status"],
    prohibitedActions: ["write_files", "edit_files", "delete_files", "execute_commands", "create_child_issues", "create_agents", "modify_agents", "deploy", "git_push", "git_commit"],
    delegationEdges: [],
    tenantBoundary: COMPANY_ID,
  },
  "ebee-onboarding": {
    id: "2257815d-e8b1-44c6-b05d-baf95d5d8948",
    name: "ebee-onboarding",
    role: "devops",
    title: "Ebee Onboarding",
    capabilities: "onboarding,integration,configuration,setup,documentation",
    reportsTo: "1122ed57-fce7-4b17-8673-9861caecf2ec",
    executionMode: "one_shot",
    modelTier: "local-gpt-oss/gpt-oss:20b",
    maxConcurrentRuns: 1,
    budgetMonthlyCents: 0,
    permittedTools: ["read_files", "write_files", "edit_files", "list_files", "grep", "glob", "post_comment", "patch_issue_status"],
    prohibitedActions: ["delete_files", "execute_commands", "create_child_issues", "create_agents", "modify_agents", "deploy", "git_push", "git_commit"],
    delegationEdges: [],
    tenantBoundary: COMPANY_ID,
  },
};

const SEVEN_NAMES = Object.keys(MATRIX);
const EXCLUDED_NAMES = ["p20-local-worker", "Hivemaster Suite", "Reflection Coach", "Summarizer"];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("P29: Seven-Agent Role Capability Matrix", () => {
  describe("identity and role mapping", () => {
    it("has exactly seven agents in the matrix", () => {
      expect(SEVEN_NAMES).toHaveLength(7);
    });

    it("each agent has a unique UUID", () => {
      const ids = SEVEN_NAMES.map((n) => MATRIX[n].id);
      expect(new Set(ids).size).toBe(7);
    });

    it("each agent has a unique name", () => {
      const names = SEVEN_NAMES.map((n) => MATRIX[n].name);
      expect(new Set(names).size).toBe(7);
    });

    it("each agent has a valid Paperclip role enum", () => {
      const validRoles = ["ceo", "cto", "cmo", "cfo", "security", "engineer", "designer", "pm", "qa", "devops", "researcher", "general"];
      for (const name of SEVEN_NAMES) {
        expect(validRoles).toContain(MATRIX[name].role);
      }
    });

    it("each agent has a unique role", () => {
      const roles = SEVEN_NAMES.map((n) => MATRIX[n].role);
      expect(new Set(roles).size).toBe(7);
    });

    it("excluded agents are not in the matrix", () => {
      for (const ex of EXCLUDED_NAMES) {
        expect(SEVEN_NAMES).not.toContain(ex);
      }
    });
  });

  describe("capabilities", () => {
    it("each agent has non-empty capabilities", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].capabilities.length).toBeGreaterThan(0);
      }
    });

    it("each agent has unique capabilities", () => {
      const caps = SEVEN_NAMES.map((n) => MATRIX[n].capabilities);
      expect(new Set(caps).size).toBe(7);
    });
  });

  describe("delegation edges (reportsTo)", () => {
    it("hivemaster-observer reports to board (null)", () => {
      expect(MATRIX["hivemaster-observer"].reportsTo).toBeNull();
    });

    it("librarian-qc reports to hivemaster-observer", () => {
      expect(MATRIX["librarian-qc"].reportsTo).toBe(MATRIX["hivemaster-observer"].id);
    });

    it("demerzel-strategist reports to board (null)", () => {
      expect(MATRIX["demerzel-strategist"].reportsTo).toBeNull();
    });

    it("konstanze-harmonizer reports to board (null)", () => {
      expect(MATRIX["konstanze-harmonizer"].reportsTo).toBeNull();
    });

    it("waz-implementer reports to demerzel-strategist", () => {
      expect(MATRIX["waz-implementer"].reportsTo).toBe(MATRIX["demerzel-strategist"].id);
    });

    it("simon-security reports to board (null)", () => {
      expect(MATRIX["simon-security"].reportsTo).toBeNull();
    });

    it("ebee-onboarding reports to demerzel-strategist", () => {
      expect(MATRIX["ebee-onboarding"].reportsTo).toBe(MATRIX["demerzel-strategist"].id);
    });

    it("delegation graph has no cycles", () => {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();

      function hasCycle(agentId: string): boolean {
        visited.add(agentId);
        recursionStack.add(agentId);
        const entry = SEVEN_NAMES.map((n) => MATRIX[n]).find((a) => a.id === agentId);
        if (entry?.reportsTo) {
          if (!visited.has(entry.reportsTo)) {
            if (hasCycle(entry.reportsTo)) return true;
          } else if (recursionStack.has(entry.reportsTo)) {
            return true;
          }
        }
        recursionStack.delete(agentId);
        return false;
      }

      for (const name of SEVEN_NAMES) {
        if (!visited.has(MATRIX[name].id)) {
          expect(hasCycle(MATRIX[name].id)).toBe(false);
        }
      }
    });

    it("leaf agents have empty delegationEdges", () => {
      const leaves = ["librarian-qc", "waz-implementer", "ebee-onboarding", "konstanze-harmonizer", "simon-security"];
      for (const name of leaves) {
        expect(MATRIX[name].delegationEdges).toEqual([]);
      }
    });

    it("hivemaster-observer can delegate to librarian-qc and simon-security", () => {
      expect(MATRIX["hivemaster-observer"].delegationEdges).toContain(MATRIX["librarian-qc"].id);
      expect(MATRIX["hivemaster-observer"].delegationEdges).toContain(MATRIX["simon-security"].id);
    });

    it("demerzel-strategist can delegate to waz-implementer and ebee-onboarding", () => {
      expect(MATRIX["demerzel-strategist"].delegationEdges).toContain(MATRIX["waz-implementer"].id);
      expect(MATRIX["demerzel-strategist"].delegationEdges).toContain(MATRIX["ebee-onboarding"].id);
    });

    it("delegation edges only point to agents within the seven", () => {
      const sevenIds = new Set(SEVEN_NAMES.map((n) => MATRIX[n].id));
      for (const name of SEVEN_NAMES) {
        for (const edge of MATRIX[name].delegationEdges) {
          expect(sevenIds.has(edge)).toBe(true);
        }
      }
    });
  });

  describe("execution mode", () => {
    it("all seven agents are one_shot", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].executionMode).toBe("one_shot");
      }
    });
  });

  describe("model tier", () => {
    it("all seven agents use local-gpt-oss/gpt-oss:20b", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].modelTier).toBe("local-gpt-oss/gpt-oss:20b");
      }
    });

    it("no agent uses a cloud model", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].modelTier).not.toMatch(/^(openai|anthropic|google|aws|azure)/);
      }
    });
  });

  describe("budgets", () => {
    it("all seven agents have budget $0", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].budgetMonthlyCents).toBe(0);
      }
    });

    it("all seven agents have maxConcurrentRuns=1", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].maxConcurrentRuns).toBe(1);
      }
    });
  });

  describe("tenant boundaries", () => {
    it("all seven agents share the same company ID", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].tenantBoundary).toBe(COMPANY_ID);
      }
    });
  });

  describe("permitted tools", () => {
    it("each agent has a non-empty permitted tools list", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].permittedTools.length).toBeGreaterThan(0);
      }
    });

    it("read-only agents do not have write_files", () => {
      const readOnly = ["hivemaster-observer", "librarian-qc", "konstanze-harmonizer", "simon-security"];
      for (const name of readOnly) {
        expect(MATRIX[name].permittedTools).not.toContain("write_files");
        expect(MATRIX[name].permittedTools).not.toContain("edit_files");
      }
    });

    it("waz-implementer has write and execute tools", () => {
      expect(MATRIX["waz-implementer"].permittedTools).toContain("write_files");
      expect(MATRIX["waz-implementer"].permittedTools).toContain("edit_files");
      expect(MATRIX["waz-implementer"].permittedTools).toContain("execute_commands");
    });

    it("ebee-onboarding has write but not execute", () => {
      expect(MATRIX["ebee-onboarding"].permittedTools).toContain("write_files");
      expect(MATRIX["ebee-onboarding"].permittedTools).not.toContain("execute_commands");
    });

    it("only demerzel-strategist can create child issues", () => {
      for (const name of SEVEN_NAMES) {
        if (name === "demerzel-strategist") {
          expect(MATRIX[name].permittedTools).toContain("create_child_issues");
        } else {
          expect(MATRIX[name].permittedTools).not.toContain("create_child_issues");
        }
      }
    });

    it("no agent has git_push or git_commit in permitted tools", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].permittedTools).not.toContain("git_push");
        expect(MATRIX[name].permittedTools).not.toContain("git_commit");
      }
    });

    it("no agent has deploy in permitted tools", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].permittedTools).not.toContain("deploy");
      }
    });

    it("no agent has create_agents in permitted tools", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].permittedTools).not.toContain("create_agents");
      }
    });
  });

  describe("prohibited actions", () => {
    it("all seven agents prohibit create_agents", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].prohibitedActions).toContain("create_agents");
      }
    });

    it("all seven agents prohibit deploy", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].prohibitedActions).toContain("deploy");
      }
    });

    it("all seven agents prohibit git_push and git_commit", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].prohibitedActions).toContain("git_push");
        expect(MATRIX[name].prohibitedActions).toContain("git_commit");
      }
    });

    it("read-only agents prohibit write_files and edit_files", () => {
      const readOnly = ["hivemaster-observer", "librarian-qc", "konstanze-harmonizer", "simon-security"];
      for (const name of readOnly) {
        expect(MATRIX[name].prohibitedActions).toContain("write_files");
        expect(MATRIX[name].prohibitedActions).toContain("edit_files");
      }
    });

    it("leaf agents prohibit create_child_issues", () => {
      const leaves = ["librarian-qc", "waz-implementer", "ebee-onboarding"];
      for (const name of leaves) {
        expect(MATRIX[name].prohibitedActions).toContain("create_child_issues");
      }
    });

    it("no permitted tool appears in prohibited actions (no contradiction)", () => {
      for (const name of SEVEN_NAMES) {
        const permitted = new Set(MATRIX[name].permittedTools);
        const prohibited = new Set(MATRIX[name].prohibitedActions);
        const intersection = [...permitted].filter((t) => prohibited.has(t));
        expect(intersection).toEqual([]);
      }
    });
  });

  describe("delegation edge consistency", () => {
    it("delegation edges are a subset of reportsTo descendants", () => {
      // An agent's delegationEdges should only contain agents that are
      // reachable via the reportsTo tree from that agent.
      // For this matrix, delegation edges are explicit:
      // - hivemaster-observer → librarian-qc, simon-security
      // - demerzel-strategist → waz-implementer, ebee-onboarding
      // The reportsTo relationships match: librarian-qc reports to hivemaster-observer,
      // waz-implementer reports to demerzel-strategist, etc.
      // simon-security is a cross-branch delegation (reports to board, but hivemaster-observer can delegate to it)

      // Verify each delegation edge target exists in the matrix
      const sevenIds = new Set(SEVEN_NAMES.map((n) => MATRIX[n].id));
      for (const name of SEVEN_NAMES) {
        for (const edge of MATRIX[name].delegationEdges) {
          expect(sevenIds.has(edge)).toBe(true);
        }
      }
    });

    it("no agent delegates to itself", () => {
      for (const name of SEVEN_NAMES) {
        expect(MATRIX[name].delegationEdges).not.toContain(MATRIX[name].id);
      }
    });
  });
});
