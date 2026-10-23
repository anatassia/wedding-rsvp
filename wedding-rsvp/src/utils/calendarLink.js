// Builds a Google Calendar "quick add" link (the documented
// calendar.google.com/calendar/render?action=TEMPLATE pattern) for one
// day of the wedding, in Asia/Kuala_Lumpur local time via the ctz param
// so no UTC conversion is needed.
export function googleCalendarLink({ date, startTime, endTime, title, location }) {
  const compact = (t) => t.replace(/:/g, "").padEnd(6, "0");
  const dateCompact = date.replace(/-/g, "");
  const dates = `${dateCompact}T${compact(startTime)}/${dateCompact}T${compact(endTime)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    location,
    ctz: "Asia/Kuala_Lumpur",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
