<script setup>
import heroImg from "../assets/image2.jpeg"
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
      <h3 class="person__name">Nur Annassia Rifdah Binti Mokhtar</h3>
      <span class="foil">&amp;</span>
      <h3 class="person__name">Nur Iskandar Bin Azmi</h3>

      <div class="person__parents">
         <div>
          <h2 class="person__label">Puteri kepada</h2>
          <h4 class="person__names">Mokhtar bin Ramli<br />&amp;<br />Farizah binti Abdullah</h4>
        </div>
        <div>
          <h2 class="person__label">Putra kepada</h2>
          <h4 class="person__names">Azmi bin Hamzah<br />&amp;<br />Farizan binti Rabu</h4>
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
  font-family: var(--font-felipa);
  font-size: clamp(1.45rem, 4.5vw, 2rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.01em;
  margin: 8px 0;
}

.person > .foil {
  display: block;
  font-family: var(--font-felipa);
  font-size: 1.6rem;
  line-height: 1;
  margin: 4px 0;
}

.person__parents {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 28px;
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
  font-family: var(--font-felipa);
  font-size: clamp(1.35rem, 4vw, 1.8rem);
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.01em;
  margin: 0;
}

@media (max-width: 480px) {
  .person__parents {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
