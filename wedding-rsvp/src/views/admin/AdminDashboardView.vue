<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAdminAuth } from "../../composables/useAdminAuth.js"
import { getPublicDates, adminListGuests } from "../../services/api.js"
import DateManager from "../../components/admin/DateManager.vue"
import GuestList from "../../components/admin/GuestList.vue"

const router = useRouter()
const { session, authReady, signOut } = useAdminAuth()

const dates = ref([])
const activeCount = ref(0)
const cancelledCount = ref(0)
const loading = ref(true)
const error = ref("")

const accessToken = computed(() => session.value?.access_token || "")

const confirmedTotal = computed(() => dates.value.reduce((sum, d) => sum + Number(d.confirmed_count || 0), 0))

async function loadAll() {
  loading.value = true
  error.value = ""
  try {
    const [datesRes, confirmedRes, cancelledRes] = await Promise.all([
      getPublicDates(),
      adminListGuests(accessToken.value, { status: "confirmed" }),
      adminListGuests(accessToken.value, { status: "cancelled" }),
    ])
    dates.value = datesRes.dates
    activeCount.value = confirmedRes.guests.length
    cancelledCount.value = cancelledRes.guests.length
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Wait for the auth composable's initial session check before deciding
  // whether to redirect — this is a UX convenience only; every admin
  // endpoint re-verifies the token and allowlist on the server regardless.
  const waitForAuth = () =>
    new Promise((resolve) => {
      const check = () => {
        if (authReady.value) resolve()
        else setTimeout(check, 30)
      }
      check()
    })
  await waitForAuth()

  if (!session.value) {
    router.replace({ name: "admin-login" })
    return
  }

  await loadAll()
})

async function handleSignOut() {
  await signOut()
  router.replace({ name: "admin-login" })
}
</script>

<template>
  <section class="section">
    <div class="container admin-dashboard">
      <div class="admin-dashboard__header">
        <h1>Papan Pemuka Penganjur</h1>
        <button type="button" class="btn btn--ghost" @click="handleSignOut">Log Keluar</button>
      </div>

      <p v-if="loading">Memuatkan...</p>
      <p v-else-if="error" class="alert alert--error">{{ error }}</p>

      <template v-else>
        <div class="admin-dashboard__stats">
          <div class="card">
            <span class="eyebrow">Jumlah Disahkan</span>
            <strong>{{ confirmedTotal }}</strong>
          </div>
          <div class="card">
            <span class="eyebrow">RSVP Aktif</span>
            <strong>{{ activeCount }}</strong>
          </div>
          <div class="card">
            <span class="eyebrow">RSVP Dibatalkan</span>
            <strong>{{ cancelledCount }}</strong>
          </div>
          <div v-for="date in dates" :key="date.id" class="card">
            <span class="eyebrow">{{ date.event_date }} &middot; {{ date.start_time }}&ndash;{{ date.end_time }}</span>
            <strong>{{ date.confirmed_count }} / {{ date.capacity }}</strong>
          </div>
        </div>

        <h2>Sesi Majlis</h2>
        <DateManager :dates="dates" :access-token="accessToken" @changed="loadAll" />

        <h2>Senarai Tetamu</h2>
        <GuestList :dates="dates" :access-token="accessToken" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.admin-dashboard {
  max-width: 920px;
}

.admin-dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin: 20px 0 36px;
}

.admin-dashboard__stats .card {
  text-align: left;
}

.admin-dashboard__stats strong {
  display: block;
  font-size: 1.6rem;
  color: var(--navy);
  margin-top: 4px;
}
</style>
