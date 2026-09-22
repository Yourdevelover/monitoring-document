const JAKARTA_TIME_ZONE = "Asia/Jakarta";

export function getJakartaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getStartOfCurrentJakartaDay(now = new Date()) {
  return new Date(`${getJakartaDateKey(now)}T00:00:00+07:00`);
}
