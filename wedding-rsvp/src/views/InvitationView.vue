<script setup>
import { ref } from "vue"
import EntryEnvelope from "../components/EntryEnvelope.vue"
import HomeNav from "../components/HomeNav.vue"
import CoupleHero from "../components/CoupleHero.vue"
import CountdownTimer from "../components/CountdownTimer.vue"
import VerseSection from "../components/VerseSection.vue"
import CoupleSection from "../components/CoupleSection.vue"
import EventSection from "../components/EventSection.vue"
import ItinerarySection from "../components/ItinerarySection.vue"
import AddressSection from "../components/AddressSection.vue"
import ContactSection from "../components/ContactSection.vue"
import FloatingPetals from "../components/FloatingPetals.vue"
import MusicControl from "../components/MusicControl.vue"
import FadeInSection from "../components/FadeInSection.vue"
import { useEventDates } from "../composables/useEventDates.js"

const { dates, loading, error, load } = useEventDates()
load()

const musicControl = ref(null)
const envelopeOpened = ref(sessionStorage.getItem("wedding:envelope-opened") === "1")

function handleEnvelopeOpened() {
  envelopeOpened.value = true
  try {
    sessionStorage.setItem("wedding:envelope-opened", "1")
  } catch {
    /* storage unavailable — fine, envelope just replays next visit */
  }
  musicControl.value?.startAfterUserGesture()
}
</script>

<template>
  <div class="invitation-view">
  <EntryEnvelope v-if="!envelopeOpened" @opened="handleEnvelopeOpened" />

  <FloatingPetals />
  <HomeNav />

  <div>
    <div id="home">
      <CoupleHero />
    </div>

    <FadeInSection>
      <section class="section section--soft">
        <VerseSection />
      </section>
    </FadeInSection>

    <FadeInSection>
      <section class="section">
        <div class="container container--narrow" style="text-align: center">
          <p>
            Dengan penuh rasa syukur ke hadrat Allah SWT, kami ingin memaklumkan
            tarikh bagi majlis perkahwinan kami. Mohon doa dan restu daripada
            semua agar segala urusan dipermudahkan dan diberkati Allah SWT.
          </p>
        </div>
      </section>
    </FadeInSection>

    <FadeInSection>
      <section id="couple" class="section section--alt">
        <CoupleSection />
      </section>
    </FadeInSection>

    <section class="section section--deep">
      <div class="container" style="text-align: center">
        <p class="eyebrow eyebrow--light">Menghitung Detik</p>
        <CountdownTimer />
      </div>
    </section>

    <FadeInSection>
      <section id="event" class="section">
        <p v-if="loading" class="container" style="text-align: center">Memuatkan...</p>
        <p v-else-if="error" class="container alert alert--error">{{ error }}</p>
        <EventSection v-else :dates="dates" />
      </section>
    </FadeInSection>

    <FadeInSection>
      <section id="tentative" class="section section--alt">
        <ItinerarySection :dates="dates" />
      </section>
    </FadeInSection>

    <FadeInSection>
      <section id="alamat" class="section">
        <AddressSection :venue="dates[0]?.venue || 'Kunang Sungai Petani'" />
      </section>
    </FadeInSection>

    <FadeInSection>
      <section id="hubungi" class="section section--alt">
        <div class="container container--narrow">
          <header class="section__head">
            <p class="eyebrow">Sebarang Pertanyaan</p>
            <h2 class="section__title">Hubungi</h2>
          </header>
          <ContactSection />
        </div>
      </section>
    </FadeInSection>

    <FadeInSection>
      <section id="rsvp" class="section section--deep">
        <div class="container container--narrow" style="text-align: center">
          <p class="eyebrow eyebrow--light">RSVP</p>
          <h2>Sudi Hadir?</h2>
          <p class="section__lead">
            Mohon sahkan kehadiran anda bagi memudahkan urusan persiapan kami.
          </p>
          <router-link to="/rsvp" class="btn" style="margin-top: 16px">Sahkan Kehadiran</router-link>
        </div>
      </section>
    </FadeInSection>

    <section class="section">
      <div class="container container--narrow" style="text-align: center">
        <p>InsyaAllah, kami nantikan kehadiran anda.</p>
        <p>Terima kasih.</p>
      </div>
    </section>
  </div>

  <footer class="home-footer">
    <div class="container" style="text-align: center">
      <div class="ornament"><i /><span>&hearts;</span><i /></div>
      <h2 class="foil">Iskandar &amp; Nasyiaa</h2>
      <p>Kami nantikan kehadiran anda.</p>
      <p class="home-footer__credit">
        27 Disember 2026 &middot; <strong>Kunang Sungai Petani</strong>
      </p>
      <router-link to="/rsvp/semak" class="home-footer__link">Semak / Ubah RSVP anda</router-link>
    </div>
  </footer>

  <MusicControl ref="musicControl" />
  </div>
</template>

<style scoped>
.home-footer {
  background: var(--navy);
  color: var(--white);
  padding: 48px 0;
  text-align: center;
}

.home-footer p {
  color: rgba(255, 255, 255, 0.78);
}

.home-footer__credit {
  margin-top: 8px;
  font-size: 0.9rem;
}

.home-footer__link {
  display: inline-block;
  margin-top: 14px;
  color: var(--white);
  font-size: 0.85rem;
  text-decoration: underline;
}
</style>
