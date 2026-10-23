import { ref } from "vue";
import { getWishes, createWish } from "../services/api.js";

export function useWishes() {
  const wishes = ref([]);
  const loading = ref(true);
  const error = ref("");
  const submitting = ref(false);
  const submitError = ref("");

  async function load() {
    loading.value = true;
    error.value = "";
    try {
      const { wishes: rows } = await getWishes();
      wishes.value = rows;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function submit(guestName, message) {
    submitting.value = true;
    submitError.value = "";
    try {
      const { wish } = await createWish({ guest_name: guestName, message });
      wishes.value = [wish, ...wishes.value];
      return true;
    } catch (err) {
      submitError.value = err.message;
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return { wishes, loading, error, submitting, submitError, load, submit };
}
