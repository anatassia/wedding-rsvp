<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAdminAuth } from "../../composables/useAdminAuth.js"

const router = useRouter()
const { signIn } = useAdminAuth()

const email = ref("")
const password = ref("")
const error = ref("")
const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  error.value = ""
  try {
    await signIn(email.value.trim(), password.value)
    router.push({ name: "admin-dashboard" })
  } catch (err) {
    error.value = err.message || "Log masuk gagal"
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="section">
    <div class="container" style="max-width: 420px">
      <h1>Log Masuk Penganjur</h1>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">Emel</label>
          <input id="email" v-model="email" type="email" required autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">Kata Laluan</label>
          <input id="password" v-model="password" type="password" required autocomplete="current-password" />
        </div>

        <p v-if="error" class="alert alert--error">{{ error }}</p>

        <button type="submit" class="btn" :disabled="submitting" style="width: 100%">
          {{ submitting ? "Log masuk..." : "Log Masuk" }}
        </button>
      </form>
    </div>
  </section>
</template>
