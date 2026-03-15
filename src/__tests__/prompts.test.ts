import { describe, it, expect } from "vitest";
import { FALLBACK_PROMPTS } from "@/lib/prompts";

describe("FALLBACK_PROMPTS", () => {
  it("has at least 10 prompts", () => {
    expect(FALLBACK_PROMPTS.length).toBeGreaterThanOrEqual(10);
  });

  it("all prompts are non-empty strings", () => {
    for (const prompt of FALLBACK_PROMPTS) {
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  it("all prompts are unique", () => {
    expect(new Set(FALLBACK_PROMPTS).size).toBe(FALLBACK_PROMPTS.length);
  });
});
