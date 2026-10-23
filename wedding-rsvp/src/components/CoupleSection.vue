<script setup>
import heroImg from "../assets/hero.png"
</script>

<template>
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Pasangan Pengantin</p>
      <h2 class="section__title">Raja Sehari</h2>
    </header>

    <article class="person">
      <div class="person__photo">
        <img :src="heroImg" alt="Iskandar dan Nasyiaa" loading="lazy" />
      </div>
      <h3 class="person__name">Nur Iskandar Bin Azmi <span class="foil">&amp;</span> Nur Annassia Rifdah Binti Mokhtar</h3>

      <div class="person__parents">
        <div>
          <p class="person__label">Putera kepada</p>
          <!-- Sila kemaskini nama penuh ibu bapa pengantin lelaki -->
          <p class="person__names">Azmi bin [Nama]<br />&amp;<br />[Nama Ibu]</p>
        </div>
        <div>
          <p class="person__label">Puteri kepada</p>
          <!-- Sila kemaskini nama penuh ibu bapa pengantin perempuan -->
          <p class="person__names">Mokhtar bin [Nama]<br />&amp;<br />Farizah binti [Nama]</p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.person {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.person__photo {
  width: 160px;
  height: 160px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--white);
  outline: 1.5px solid var(--border);
  box-shadow: var(--shadow);
}

.person__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person__name {
  font-family: var(--font-heading);
  font-size: clamp(1.2rem, 3.4vw, 1.6rem);
  line-height: 1.4;
  margin-bottom: 24px;
}

.person__parents {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.person__label {
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 6px;
}

.person__names {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .person__parents {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
