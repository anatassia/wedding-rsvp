<script setup>
import { ref } from "vue"

const open = ref(false)

const links = [
  { href: "#home", label: "Utama" },
  { href: "#couple", label: "Pengantin" },
  { href: "#event", label: "Majlis" },
  { href: "#alamat", label: "Alamat" },
  { href: "#ucapan", label: "Ucapan" },
  { href: "#hubungi", label: "Hubungi" },
]

function close() {
  open.value = false
}
</script>

<template>
  <header class="home-nav">
    <div class="container home-nav__bar">
      <a href="#home" class="home-nav__brand" @click="close">I <span>&amp;</span> N</a>

      <button
        class="home-nav__toggle"
        type="button"
        :aria-expanded="open"
        aria-label="Buka menu"
        @click="open = !open"
      >
        <span /><span />
      </button>

      <nav class="home-nav__menu" :class="{ 'is-open': open }">
        <a v-for="link in links" :key="link.href" :href="link.href" @click="close">{{ link.label }}</a>
        <router-link to="/rsvp" class="home-nav__cta" @click="close">RSVP</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.home-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.home-nav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
}

.home-nav__brand {
  font-family: var(--font-script);
  font-size: 1.5rem;
  color: var(--navy);
  text-decoration: none;
}

.home-nav__brand span {
  color: var(--accent);
}

.home-nav__menu {
  display: flex;
  align-items: center;
  gap: 22px;
}

.home-nav__menu a {
  color: var(--navy);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.home-nav__cta {
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--navy);
  color: var(--white) !important;
}

.home-nav__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.home-nav__toggle span {
  width: 22px;
  height: 2px;
  background: var(--navy);
  display: block;
}

@media (max-width: 720px) {
  .home-nav__toggle {
    display: flex;
  }

  .home-nav__menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .home-nav__menu.is-open {
    display: flex;
  }

  .home-nav__menu a {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
  }

  .home-nav__cta {
    border-radius: 0;
    text-align: center;
  }
}
</style>
