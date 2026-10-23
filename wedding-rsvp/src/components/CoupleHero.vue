<script setup>
import { ref } from "vue"
import heroImg from "../assets/story-photo.jpeg"
import { useParallax } from "../composables/useParallax.js"

const heroPhoto = ref(null)
useParallax(heroPhoto, { intensity: 0.08 })
</script>

<template>
  <section class="couple-hero">
    <div class="container couple-hero__inner">
      <span class="eyebrow">Walimatulurus</span>
      <p class="couple-hero__kicker">Jemputan Perkahwinan</p>

      <h1 class="couple-hero__names">
        Iskandar
        <span class="couple-hero__amp">&amp;</span>
        Nasyiaa
      </h1>

      <div class="photo-frame parallax-photo" ref="heroPhoto">
        <img :src="heroImg" alt="Iskandar dan Nasyiaa" />
      </div>

      <p class="couple-hero__tagline">Dua hati, satu perjalanan.</p>

    </div>
  </section>
</template>

<style scoped>
.couple-hero {
  padding: 56px 0 40px;
  text-align: center;
}

.couple-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.couple-hero__kicker {
  margin: 0;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.couple-hero__names {
  margin: 4px 0 18px;
}

.couple-hero__amp {
  display: block;
  color: var(--accent);
  font-size: 0.6em;
  margin: 2px 0;
}

.couple-hero__tagline {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--navy);
  margin: 14px 0 6px;
}

</style>
