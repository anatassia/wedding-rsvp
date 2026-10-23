import { ref, onMounted, onUnmounted } from "vue";
import { getSupabaseAuthClient } from "../services/supabaseAuth.js";

const session = ref(null);
const authReady = ref(false);

export function useAdminAuth() {
  let unsubscribe = null;

  onMounted(async () => {
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      authReady.value = true;
      return;
    }

    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    authReady.value = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
    });
    unsubscribe = () => sub.subscription.unsubscribe();
  });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  async function signIn(email, password) {
    const supabase = getSupabaseAuthClient();
    if (!supabase) throw new Error("Organiser login is not configured");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    session.value = data.session;
    return data.session;
  }

  async function signOut() {
    const supabase = getSupabaseAuthClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    session.value = null;
  }

  return { session, authReady, signIn, signOut };
}
