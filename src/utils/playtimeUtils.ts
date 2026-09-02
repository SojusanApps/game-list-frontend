/**
 * Playtime is stored on the backend in minutes, but entered and displayed in
 * hours (users think in hours and expect to type values like `112.8`).
 */

/** Convert a playtime in hours (as entered by the user) to whole minutes for the backend. */
export function playtimeHoursToMinutes(hours?: number | null): number | null {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return null;
  return Math.round(hours * 60);
}

/** Convert a playtime in minutes (from the backend) to hours, rounded to one decimal place. */
export function playtimeMinutesToHours(minutes?: number | null): number | null {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return null;
  return Math.round((minutes / 60) * 10) / 10;
}
