import { onMounted, onUnmounted } from "vue";

// Gentle scroll-linked parallax for a photo element. No-ops entirely when
// the visitor prefers reduced motion, so it never fights with scrolling,
// reading, or form focus.
export function useParallax(elRef, { intensity = 0.06 } = {}) {
  let ticking = false;

  function onScroll() {
    if (ticking || !elRef.value) return;
    ticking = true;

    requestAnimationFrame(() => {
      const rect = elRef.value.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distance = rect.top + rect.height / 2 - viewportCenter;
      elRef.value.style.transform = `translateY(${(distance * intensity).toFixed(2)}px)`;
      ticking = false;
    });
  }

  onMounted(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
  });
}
