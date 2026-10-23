<script setup>
import FadeInSection from "../components/FadeInSection.vue"
import ContactSection from "../components/ContactSection.vue"
</script>

<template>
  <section class="section">
    <div class="container jemputan">
      <FadeInSection>
        <p class="jemputan__arabic">السلام عليكم</p>
      </FadeInSection>

      <FadeInSection>
        <div class="jemputan__parents">
          <p>MOKHTAR BIN RAMLI</p>
          <p class="jemputan__amp">&amp;</p>
          <p>FARIZAH BINTI ABDULLAH</p>
        </div>
      </FadeInSection>

      <FadeInSection>
        <p class="jemputan__body">
          Dengan penuh rasa syukur ke hadrat Allah SWT, kami ingin menjemput
          Dato&rsquo; / Datin / Tuan / Puan / Encik / Cik sekeluarga untuk
          menghadiri majlis perkahwinan puteri kami yang tercinta:
        </p>
      </FadeInSection>

      <FadeInSection>
        <div class="jemputan__couple">
          <p>NUR ANNASSIA RIFDAH BINTI MOKHTAR</p>
          <p class="jemputan__amp">&amp;</p>
          <p>NUR ISKANDAR BIN AZMI</p>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div class="jemputan__meta">
          <p>27 Disember 2026</p>
          <p>11:30 pagi hingga 4:30 petang</p>
          <p>KUNANG-KUNANG</p>
        </div>
      </FadeInSection>

      <FadeInSection>
        <ContactSection />
      </FadeInSection>
    </div>
  </section>
</template>

<style scoped>
.jemputan {
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.jemputan__arabic {
  font-size: 1.6rem;
  color: var(--navy);
  margin: 0;
}

.jemputan__parents p,
.jemputan__couple p {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--navy);
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

.jemputan__couple p {
  font-size: 1.2rem;
}

.jemputan__amp {
  color: var(--accent);
  margin: 6px 0 !important;
}

.jemputan__body {
  line-height: 1.7;
}

.jemputan__meta p {
  margin: 0 0 4px;
  color: var(--text-muted);
}
</style>
