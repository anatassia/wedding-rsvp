<script setup>
import FadeInSection from "../components/FadeInSection.vue"
import image1 from "../assets/story-photo.jpeg"
</script>

<template>
  <section class="section">
    <div class="container story">
      <FadeInSection>
          <div class="photo-frame"><img :src="image1" alt="Iskandar dan Nasyiaa" /></div>
        <!-- <div class="photo-frame photo-frame--placeholder">
          Ruang foto kedua<br />(story-photo.jpg belum dimuat naik)
        </div> -->
      </FadeInSection>

      <FadeInSection>
        <blockquote class="story__quote">
          <p>&ldquo;Dan Kami menciptakan kamu berpasang-pasangan.&rdquo;</p>
          <cite>— Surah An-Naba&rsquo;: 8</cite>
        </blockquote>
      </FadeInSection>

      <FadeInSection>
        <div class="story__body">
          <p>Sebuah janji, satu cinta.</p>
          <p>
            Dua insan dipertemukan dalam aturan-Nya, membawa harapan dan doa untuk
            sebuah kehidupan yang baharu. Semoga langkah yang bakal ditempuh
            sentiasa diberkati, dipenuhi kasih, dan kekal teguh hingga ke
            penghujung waktu.
          </p>
        </div>
      </FadeInSection>
    </div>
  </section>
</template>

<style scoped>
.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  text-align: center;
}

.story__quote {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.4rem;
  color: var(--navy);
}

.story__quote cite {
  display: block;
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--text-muted);
  font-style: normal;
}

.story__body p {
  font-size: 1.05rem;
}
</style>
