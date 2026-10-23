<script setup>
import { ref } from "vue"
import { useWishes } from "../composables/useWishes.js"

const { wishes, loading, error, submitting, submitError, load, submit } = useWishes()
load()

const guestName = ref("")
const message = ref("")
const sent = ref(false)

async function handleSubmit() {
  sent.value = false
  const ok = await submit(guestName.value, message.value)
  if (ok) {
    guestName.value = ""
    message.value = ""
    sent.value = true
  }
}

function formatWhen(iso) {
  try {
    return new Intl.DateTimeFormat("ms-MY", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso))
  } catch {
    return ""
  }
}
</script>

<template>
  <div class="container container--narrow">
    <header class="section__head">
      <p class="eyebrow">Doa &amp; Restu</p>
      <h2 class="section__title">Ucapan</h2>
    </header>

    <form class="wish-form" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="wish-name">Nama</label>
        <input id="wish-name" v-model="guestName" type="text" maxlength="100" required placeholder="Nama anda" />
      </div>
      <div class="field">
        <label for="wish-message">Ucapan</label>
        <textarea id="wish-message" v-model="message" maxlength="500" rows="3" required placeholder="Tulis doa dan restu anda..." />
      </div>

      <p v-if="submitError" class="alert alert--error">{{ submitError }}</p>
      <p v-if="sent" class="alert alert--success">Terima kasih atas ucapan anda!</p>

      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? "Menghantar..." : "Hantar Ucapan" }}
      </button>
    </form>

    <div class="wish-list">
      <p v-if="loading" style="text-align: center">Memuatkan...</p>
      <p v-else-if="error" class="alert alert--error">{{ error }}</p>
      <p v-else-if="!wishes.length" style="text-align: center">Jadilah yang pertama memberi ucapan.</p>

      <article v-for="wish in wishes" :key="wish.id" class="wish-card">
        <div class="wish-card__head">
          <p class="wish-card__name">{{ wish.guest_name }}</p>
          <p class="wish-card__date">{{ formatWhen(wish.created_at) }}</p>
        </div>
        <p class="wish-card__message">{{ wish.message }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.wish-form {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 32px;
}

.wish-form .btn {
  width: 100%;
}

.wish-list {
  display: grid;
  gap: 14px;
}

.wish-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: var(--shadow);
  text-align: left;
}

.wish-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.wish-card__name {
  font-weight: 600;
  color: var(--navy);
  margin: 0;
}

.wish-card__date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
}

.wish-card__message {
  margin: 0;
  color: var(--text);
}
</style>
