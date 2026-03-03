<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const router = useRouter()

const theme = ref(localStorage.getItem('dexguess-theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('dexguess-theme', theme.value)
}

onMounted(() => {
  document.documentElement.dataset.theme = theme.value
})
</script>

<template>
  <div class="flex flex-col h-dvh" :style="{ background: 'var(--bg)' }">
    <!-- Header -->
    <header
      class="flex h-14 shrink-0 items-center justify-between px-5 cursor-pointer select-none transition-colors duration-300"
      :style="{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }"
      @click="router.push('/')"
    >
      <!-- Left: Logo -->
      <div class="flex items-center gap-2">
        <!-- Target icon (lucide) -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF6B6B"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span
          class="text-xl font-extrabold tracking-tight"
          :style="{ color: 'var(--text-primary)' }"
        >
          DexGuess
        </span>
      </div>

      <!-- Right: Theme Toggle -->
      <button
        @click.stop="toggleTheme"
        class="relative w-14 h-7 rounded-full transition-colors duration-300"
        :style="{
          background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-elevated)',
        }"
      >
        <!-- Icons container -->
        <div class="absolute inset-0 flex items-center justify-between px-1.5 z-0">
          <Sun class="w-4 h-4 text-amber-500" />
          <Moon class="w-4 h-4 text-slate-300" />
        </div>
        <!-- Knob -->
        <span
          class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 z-10"
          :class="theme === 'dark' ? 'translate-x-7' : 'translate-x-0'"
        />
      </button>
    </header>

    <main
      class="flex-1 overflow-auto p-6 transition-colors duration-300"
      :style="{ background: 'var(--bg)' }"
    >
      <RouterView />
    </main>
  </div>
</template>
