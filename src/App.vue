<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div
    class="dark flex flex-col h-screen relative overflow-hidden"
    style="background: oklch(0.08 0.018 265)"
  >
    <!-- Decorative background blobs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 left-0 w-[700px] h-[700px] rounded-full"
        style="
          background: radial-gradient(circle, oklch(0.62 0.26 20 / 0.08) 0%, transparent 65%);
          transform: translate(-35%, -35%);
        "
      ></div>
      <div
        class="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
        style="
          background: radial-gradient(circle, oklch(0.85 0.19 88 / 0.06) 0%, transparent 65%);
          transform: translate(35%, 35%);
        "
      ></div>
      <!-- Large decorative Pokeball watermark -->
      <div
        class="absolute -top-16 -right-16 w-64 h-64 opacity-[0.025]"
        style="animation: spin-slow 60s linear infinite"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <clipPath id="wm-upper"><rect x="0" y="0" width="100" height="50" /></clipPath>
          <clipPath id="wm-lower"><rect x="0" y="50" width="100" height="50" /></clipPath>
          <circle cx="50" cy="50" r="48" fill="white" clip-path="url(#wm-upper)" />
          <circle cx="50" cy="50" r="48" fill="white" clip-path="url(#wm-lower)" opacity="0.4" />
          <rect x="0" y="46" width="100" height="8" fill="black" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="black" stroke-width="4" />
          <circle cx="50" cy="50" r="14" fill="black" />
          <circle cx="50" cy="50" r="8" fill="white" opacity="0.5" />
        </svg>
      </div>
    </div>

    <!-- Header -->
    <header
      class="relative z-10 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.08] px-5 cursor-pointer select-none transition-colors hover:bg-white/[0.02]"
      style="background: oklch(0.08 0.018 265 / 0.85); backdrop-filter: blur(20px)"
      @click="router.push('/')"
    >
      <!-- Pokeball icon -->
      <div class="w-8 h-8 shrink-0 float">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <clipPath id="hdr-upper"><rect x="0" y="0" width="100" height="50" /></clipPath>
          <clipPath id="hdr-lower"><rect x="0" y="50" width="100" height="50" /></clipPath>
          <circle cx="50" cy="50" r="46" fill="#ef4444" clip-path="url(#hdr-upper)" />
          <circle cx="50" cy="50" r="46" fill="#374151" clip-path="url(#hdr-lower)" />
          <rect x="2" y="46" width="96" height="8" fill="#111827" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#111827" stroke-width="4" />
          <circle cx="50" cy="50" r="13" fill="#111827" />
          <circle cx="50" cy="50" r="7" fill="#9ca3af" />
        </svg>
      </div>

      <!-- Title -->
      <span class="text-xl font-black tracking-tight gradient-text">DexGuess</span>

      <!-- Route pill -->
      <span
        class="ml-auto text-xs font-medium px-2.5 py-1 rounded-full border border-white/[0.08] text-white/30"
        style="background: rgb(255 255 255 / 0.04)"
      >
        {{ router.currentRoute.value.name }}
      </span>
    </header>

    <main class="flex-1 overflow-auto relative z-10">
      <RouterView />
    </main>
  </div>
</template>
