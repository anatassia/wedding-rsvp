<script setup>
defineProps({
  venue: { type: String, default: "" },
})

const mapsUrl = import.meta.env.VITE_GOOGLE_MAPS_URL ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Kunang Sungai Petani")}`
</script>

<template>
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Panduan Lokasi</p>
      <h2 class="section__title">Alamat</h2>
    </header>

    <article class="address-card">
      <svg class="address-card__icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
      </svg>
      <p class="address-card__kicker">Majlis Perkahwinan</p>
      <h3 class="address-card__name">{{ venue }}</h3>
      <a class="btn btn--outline" :href="mapsUrl" target="_blank" rel="noopener">Buka Peta</a>
    </article>
  </div>
</template>

<style scoped>
.address-card {
  max-width: 360px;
  margin: 0 auto;
  text-align: center;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: var(--shadow);
}

.address-card__icon {
  color: var(--accent);
  margin-bottom: 14px;
}

.address-card__kicker {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}

.address-card__name {
  margin-bottom: 20px;
}
</style>
