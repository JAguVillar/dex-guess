<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

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
        class="relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center"
        :style="{
          background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-elevated)',
        }"
      >
        <!-- Sun icon -->
        <svg
          v-if="theme === 'light'"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute left-1.5"
          :style="{ color: 'var(--text-secondary)' }"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <!-- Moon icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute right-1.5"
          style="color: white"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <!-- Knob -->
        <span
          class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
          :class="theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'"
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
