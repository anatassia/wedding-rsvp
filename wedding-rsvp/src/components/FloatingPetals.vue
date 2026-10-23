<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const canvas = ref(null)
let ctx = null
let petals = []
let frameId = null
let resizeObserver = null

const PETAL_COLORS = ["#8fb0c9", "#b7cfe0", "#dbe8f1", "#6f93ad"]

function makePetal(width, height, initial = false) {
  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : -20,
    size: 6 + Math.random() * 8,
    speedY: 0.4 + Math.random() * 0.6,
    speedX: Math.random() * 0.6 - 0.3,
    drift: Math.random() * Math.PI * 2,
    driftSpeed: 0.01 + Math.random() * 0.02,
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    opacity: 0.4 + Math.random() * 0.4,
  }
}

function drawPetal(p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function tick() {
  if (!ctx || !canvas.value) return
  const { width, height } = canvas.value
  ctx.clearRect(0, 0, width, height)

  for (const p of petals) {
    p.drift += p.driftSpeed
    p.x += p.speedX + Math.sin(p.drift) * 0.4
    p.y += p.speedY
    p.rotation += p.rotationSpeed

    if (p.y > height + 20) {
      Object.assign(p, makePetal(width, height))
      p.y = -20
    }
    drawPetal(p)
  }

  frameId = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!canvas.value) return
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (prefersReducedMotion) return

  ctx = canvas.value.getContext("2d")
  resize()
  petals = Array.from({ length: 18 }, () => makePetal(canvas.value.width, canvas.value.height, true))

  resizeObserver = () => resize()
  window.addEventListener("resize", resizeObserver)

  tick()
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  if (resizeObserver) window.removeEventListener("resize", resizeObserver)
})
</script>

<template>
  <canvas ref="canvas" class="floating-petals" aria-hidden="true" />
</template>

<style scoped>
.floating-petals {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
</style>
