import { ref } from "vue";
import { getPublicDates } from "../services/api.js";

export function useEventDates() {
  const dates = ref([]);
  const loading = ref(true);
  const error = ref("");

  async function load() {
    loading.value = true;
    error.value = "";
    try {
      const { dates: rows } = await getPublicDates();
      dates.value = rows;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return { dates, loading, error, load };
}
