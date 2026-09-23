import { describe, expect, it } from "vitest";
import { monthsUntil, planSummary } from "../../src/lib/plan";

describe("wedding plan calculations", () => {
  it("calculates remaining savings and monthly contribution", () => {
    const categories = [{ id: "one", name: "One", budget: 60000000, saved: 6000000, color: "#000" }];
    expect(planSummary(categories, "2027-12-10", new Date("2026-09-22")).monthly).toBe(3600000);
    expect(planSummary(categories, "2027-12-10", new Date("2026-09-22")).progress).toBe(10);
  });

  it("never returns fewer than one month", () => {
    expect(monthsUntil("2026-01-01", new Date("2026-09-22"))).toBe(1);
  });
});
