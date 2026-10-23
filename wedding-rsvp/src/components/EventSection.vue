<script setup>
import { computed } from "vue"
import { formatMalayDate, getMalayDayName, formatEventTime } from "../utils/formatDate.js"
import { googleCalendarLink } from "../utils/calendarLink.js"

const props = defineProps({
  dates: { type: Array, default: () => [] },
})

const mapsUrl = import.meta.env.VITE_GOOGLE_MAPS_URL ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Kunang Sungai Petani")}`

const event = computed(() => {
  if (!props.dates.length) return null
  const first = props.dates[0]

  const sessions = props.dates.map((d, i) => ({
    id: d.id,
    label: `Sesi ${i + 1}`,
    time: formatEventTime(d.start_time, d.end_time),
    calendarHref: googleCalendarLink({
      date: d.event_date,
      startTime: d.start_time || "12:00",
      endTime: d.end_time || "17:00",
      title: `Walimatulurus Iskandar & Nasyiaa — Sesi ${i + 1}`,
      location: d.venue,
    }),
  }))

  return {
    date: formatMalayDate(first.event_date),
    day: getMalayDayName(first.event_date),
    venue: first.venue,
    sessions,
  }
})
</script>

<template>
  <div class="container container--narrow">
    <header class="section__head">
      <p class="eyebrow">Tarikh &amp; Tempat</p>
      <h2 class="section__title">Atur Majlis</h2>
    </header>

    <article v-if="event" class="event-card">
      <p class="event-card__kicker">Majlis Perkahwinan</p>
      <h3 class="event-card__name">Iskandar &amp; Nasyiaa</h3>
      <div class="event-card__rule" aria-hidden="true" />

      <dl class="detail">
        <div class="detail__row">
          <dt>Tarikh</dt>
          <dd>{{ event.date }}</dd>
        </div>
        <div class="detail__row">
          <dt>Hari</dt>
          <dd>{{ event.day }}</dd>
        </div>
        <div class="detail__row">
          <dt>Tempat</dt>
          <dd><strong>{{ event.venue }}</strong></dd>
        </div>
        <div v-for="session in event.sessions" :key="session.id" class="detail__row">
          <dt>{{ session.label }}</dt>
          <dd>{{ session.time }}</dd>
        </div>
      </dl>

      <div class="event-card__actions">
        <a class="btn" :href="mapsUrl" target="_blank" rel="noopener">Lokasi</a>
        <a
          v-for="session in event.sessions"
          :key="session.id"
          class="btn btn--outline"
          :href="session.calendarHref"
          target="_blank"
          rel="noopener"
        >
          Tambah Kalendar &mdash; {{ session.label }}
        </a>
      </div>
    </article>
  </div>
</template>

<style scoped>
.event-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: var(--shadow);
  text-align: center;
}

.event-card__kicker {
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 4px;
}

.event-card__name {
  margin-bottom: 14px;
}

.event-card__rule {
  width: 40px;
  height: 1px;
  background: var(--border);
  margin: 0 auto 18px;
}

.detail {
  margin: 0 0 20px;
}

.detail__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
  text-align: left;
}

.detail__row:first-child {
  border-top: none;
}

.detail__row dt {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.detail__row dd {
  margin: 0;
  text-align: right;
  font-size: 0.92rem;
}

.event-card__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
