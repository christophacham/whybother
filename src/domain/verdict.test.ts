import { describe, expect, it } from "vite-plus/test";

import { judge } from "./verdict.ts";

describe("judge", () => {
  it("says fix now when doing nothing is risky and the fix is affordable", () => {
    const result = judge({ pain: 2, risk: 5, gain: 4, cost: 3 }, 25);
    expect(result.verdict).toBe("FixNow");
    expect(result.reasons).toEqual([
      "doing nothing is risky",
      "it rarely hurts",
      "the fix is a big step up",
    ]);
  });

  it("says not now when the fix costs more than it buys", () => {
    expect(judge({ pain: 3, risk: 2, gain: 3, cost: 4 }, 50).verdict).toBe("NotNow");
  });

  it("says good enough when little is at stake", () => {
    expect(judge({ pain: 2, risk: 1, gain: 2, cost: 3 }, 70).verdict).toBe("GoodEnough");
  });

  it("says good enough once today is nearly the proper solution, whatever the answers", () => {
    const result = judge({ pain: 5, risk: 5, gain: 5, cost: 1 }, 95);
    expect(result.verdict).toBe("GoodEnough");
    expect(result.reasons).toContain("you are already most of the way there");
  });

  it("values the same answers less the closer today already is", () => {
    const answers = { pain: 4, risk: 2, gain: 4, cost: 2 } as const;
    expect(judge(answers, 40).verdict).toBe("FixNow");
    expect(judge(answers, 85).verdict).toBe("NotNow");
  });
});
