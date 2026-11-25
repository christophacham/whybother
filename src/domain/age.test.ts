import { describe, expect, it } from "vite-plus/test";

import { age } from "./age.ts";

const NOW = Date.parse("2026-11-24T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const HOUR = 3_600_000;

describe("age", () => {
  it("says just now for the first minute, and for a clock that is ahead", () => {
    expect(age(ago(30_000), NOW)).toBe("just now");
    expect(age(ago(-HOUR), NOW)).toBe("just now");
  });

  it("uses the largest unit that fits", () => {
    expect(age(ago(5 * 60_000), NOW)).toBe("5 minutes ago");
    expect(age(ago(5 * HOUR), NOW)).toBe("5 hours ago");
    expect(age(ago(30 * HOUR), NOW)).toBe("yesterday");
    expect(age(ago(6 * 24 * HOUR), NOW)).toBe("6 days ago");
    expect(age(ago(400 * 24 * HOUR), NOW)).toBe("last year");
  });

  it("gives nothing for a createdAt that is not a date", () => {
    expect(age("not a date", NOW)).toBeUndefined();
  });
});
