const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

const MALAY_DAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];

export function formatMalayDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MALAY_MONTHS[month - 1]} ${year}`;
}

export function getMalayDayName(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  // Noon UTC avoids any DST/timezone-boundary edge case shifting the date.
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return MALAY_DAYS[date.getUTCDay()];
}

export function formatClock12(time) {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minutePart = minute ? `:${String(minute).padStart(2, "0")}` : ":00";

  let period;
  if (hour === 12) period = "tengah hari";
  else if (hour < 12) period = "pagi";
  else if (hour < 19) period = "petang";
  else period = "malam";

  return `${hour12}${minutePart} ${period}`;
}

export function formatEventTime(startTime, endTime) {
  if (!startTime || !endTime) return "Waktu akan dimaklumkan";
  return `${formatClock12(startTime)} hingga ${formatClock12(endTime)}`;
}
