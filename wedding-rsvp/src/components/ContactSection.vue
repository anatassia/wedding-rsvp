<script setup>
const contacts = [
  { name: "Mokhtar", phone: "013-584 2186" },
  { name: "Farizah", phone: "013-526 8755" },
  { name: "Tasha", phone: "018-577 2820" },
]

function telHref(phone) {
  const digits = phone.replace(/[^0-9]/g, "")
  const local = digits.startsWith("0") ? `+60${digits.slice(1)}` : `+${digits}`
  return `tel:${local}`
}
</script>

<template>
  <div class="contact-section">
    <div class="contact-section__grid">
      <a
        v-for="contact in contacts"
        :key="contact.name"
        :href="telHref(contact.phone)"
        class="contact-card"
      >
        <svg class="contact-card__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        </svg>
        <span class="contact-card__name">{{ contact.name }}</span>
        <span class="contact-card__phone">{{ contact.phone }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.contact-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px 14px;
  text-decoration: none;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.contact-card:hover,
.contact-card:focus-visible {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.contact-card__icon {
  color: var(--accent);
  margin-bottom: 4px;
}

.contact-card__name {
  font-weight: 600;
  color: var(--navy);
}

.contact-card__phone {
  color: var(--text-muted);
  font-size: 0.88rem;
}
</style>
