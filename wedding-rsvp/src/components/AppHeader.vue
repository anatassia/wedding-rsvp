<script setup>
import { ref } from "vue"

const open = ref(false)
</script>

<template>
  <header class="site-header">
    <div class="container site-header__bar">
      <router-link to="/" class="site-header__brand" @click="open = false">
        Nasyiaa & Iskandar
      </router-link>

      <button
        class="site-header__toggle"
        type="button"
        :aria-expanded="open"
        aria-label="Buka menu"
        @click="open = !open"
      >
        <span />
        <span />
        <span />
      </button>

      <nav class="site-header__nav" :class="{ 'is-open': open }">
        <router-link to="/" @click="open = false">Utama</router-link>
        <router-link to="/kisah-kami" @click="open = false">Kisah Kami</router-link>
        <router-link to="/jemputan" @click="open = false">Jemputan</router-link>
        <router-link to="/rsvp" @click="open = false">RSVP</router-link>
        <router-link to="/rsvp/semak" @click="open = false">Semak RSVP</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--border);
  background: var(--white);
  position: sticky;
  top: 0;
  z-index: 20;
}

.site-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.site-header__brand {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--navy);
  text-decoration: none;
}

.site-header__nav {
  display: flex;
  gap: 24px;
}

.site-header__nav a {
  color: var(--navy);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

.site-header__nav a.router-link-active {
  color: var(--green);
}

.site-header__toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.site-header__toggle span {
  width: 22px;
  height: 2px;
  background: var(--navy);
  display: block;
}

@media (max-width: 640px) {
  .site-header__toggle {
    display: flex;
  }

  .site-header__nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .site-header__nav.is-open {
    display: flex;
  }

  .site-header__nav a {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
  }
}
</style>
