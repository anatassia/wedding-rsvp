<template>
  <footer class="site-footer">
    <div class="container">
      <p>Iskandar &amp; Nasyiaa &middot; 27 Disember 2026</p>
      <router-link to="/rsvp/semak" class="site-footer__link">Semak / Ubah RSVP anda</router-link>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
  padding: 28px 0;
  text-align: center;
}

.site-footer p {
  margin: 0 0 6px;
  font-size: 0.9rem;
}

.site-footer__link {
  font-size: 0.85rem;
  text-decoration: underline;
}
</style>
