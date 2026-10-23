<script setup>
const items = [
  {
    href: "/#event",
    label: "Kalendar",
    path: "M8 2v4M16 2v4M3.5 9h17M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  },
  {
    href: "/#alamat",
    label: "Lokasi",
    path: "M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    href: "/#hubungi",
    label: "Hubungi",
    path: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  },
  {
    href: "/#ucapan",
    label: "Ucapan",
    path: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="Pautan pantas">
    <div class="bottom-nav__bar">
      <a v-for="item in items" :key="item.href" :href="item.href" class="bottom-nav__item">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="item.path" />
        </svg>
        <span>{{ item.label }}</span>
      </a>

      <router-link to="/rsvp" class="bottom-nav__item bottom-nav__item--cta">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 4h16v16H4z" />
          <path d="M4 5l8 7 8-7" />
        </svg>
        <span>RSVP</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: none;
}

@media (max-width: 720px) {
  .bottom-nav {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    padding: 0 10px calc(10px + env(safe-area-inset-bottom));
    pointer-events: none;
  }

  .bottom-nav__bar {
    pointer-events: auto;
    display: flex;
    align-items: stretch;
    gap: 2px;
    max-width: 440px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    padding: 8px;
    box-shadow: 0 10px 30px rgba(74, 107, 133, 0.22), 0 2px 8px rgba(74, 107, 133, 0.12);
  }

  .bottom-nav__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    color: var(--navy);
    text-decoration: none;
    font-size: 0.64rem;
    font-weight: 600;
    padding: 6px 2px;
    border-radius: 16px;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .bottom-nav__item:active {
    background: rgba(74, 107, 133, 0.1);
  }

  .bottom-nav__item--cta {
    color: var(--white);
    background: var(--navy);
  }

  .bottom-nav__item--cta:active {
    background: var(--navy);
    opacity: 0.85;
  }
}
</style>
