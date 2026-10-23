<template>
  <div class="verse container container--narrow">
    <p class="verse__bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
    <p class="verse__text">
      &ldquo;Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu
      pasangan hidup dari jenismu sendiri supaya kamu memperoleh ketenangan,
      dan dijadikan-Nya rasa kasih dan sayang di antara kamu.&rdquo;
    </p>
    <p class="verse__cite">Surah Ar-Rum : 21</p>
  </div>
</template>

<style scoped>
.verse {
  text-align: center;
}

.verse__bismillah {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--navy);
  margin-bottom: 18px;
}

.verse__text {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(1.05rem, 2.6vw, 1.3rem);
  color: var(--text);
  line-height: 1.7;
}

.verse__cite {
  margin-top: 10px;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
</style>
