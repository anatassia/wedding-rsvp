<script setup>
defineProps({
  corner: {
    type: String,
    default: "top-left",
    validator: (v) => ["top-left", "top-right", "bottom-left", "bottom-right"].includes(v),
  },
})
</script>

<template>
  <svg
    class="floral-decoration"
    :class="`floral-decoration--${corner}`"
    width="110"
    height="110"
    viewBox="0 0 110 110"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 4 C 30 10, 40 30, 36 55 C 60 50, 80 60, 86 86"
      fill="none"
      stroke="var(--green)"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.55"
    />
    <circle cx="18" cy="14" r="7" fill="var(--white)" stroke="var(--green)" stroke-width="1.2" />
    <circle cx="34" cy="8" r="5" fill="var(--white)" stroke="var(--green)" stroke-width="1.2" />
    <circle cx="46" cy="34" r="6" fill="var(--white)" stroke="var(--green)" stroke-width="1.2" />
    <ellipse cx="60" cy="58" rx="6" ry="3.5" fill="var(--green)" opacity="0.35" transform="rotate(35 60 58)" />
    <ellipse cx="74" cy="70" rx="7" ry="4" fill="var(--green)" opacity="0.3" transform="rotate(50 74 70)" />
  </svg>
</template>

<style scoped>
.floral-decoration {
  position: absolute;
  pointer-events: none;
}

.floral-decoration--top-left {
  top: 0;
  left: 0;
}

.floral-decoration--top-right {
  top: 0;
  right: 0;
  transform: scaleX(-1);
}

.floral-decoration--bottom-left {
  bottom: 0;
  left: 0;
  transform: scaleY(-1);
}

.floral-decoration--bottom-right {
  bottom: 0;
  right: 0;
  transform: scale(-1, -1);
}

@media (max-width: 480px) {
  .floral-decoration {
    width: 70px;
    height: 70px;
  }
}
</style>
