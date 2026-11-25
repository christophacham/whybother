const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS = [
  ["year", 365 * DAY],
  ["month", 30 * DAY],
  ["week", 7 * DAY],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
] as const;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * How long ago a problem was captured: "just now", "5 hours ago", "yesterday". Undefined when
 * `createdAt` is not a date, which the schema allows because it only asks for a string.
 */
export const age = (createdAt: string, now: number): string | undefined => {
  const elapsed = now - Date.parse(createdAt);
  if (Number.isNaN(elapsed)) return undefined;
  for (const [unit, length] of UNITS) {
    if (elapsed >= length) return relative.format(-Math.floor(elapsed / length), unit);
  }
  return "just now";
};
