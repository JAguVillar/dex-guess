<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()

const bgColor = computed(() => router.currentRoute.value.meta?.bgColor || '#fdfcfe')
const routeName = computed(() => router.currentRoute.value.name)
</script>

<template>
  <div class="flex flex-col h-dvh">
    <!-- <header
      class="flex h-16 shrink-0 items-center gap-3 px-6 bg-white border-b border-[#E2DFFE] shadow-[0_1px_3px_rgba(60,49,91,0.08)] cursor-pointer select-none"
      @click="router.push('/')"
    >
      <span class="text-xl leading-none">🎯</span>
      <div class="flex flex-col leading-tight">
        <span class="font-bold text-lg text-[#3c315b] tracking-tight">DexGuess</span>
        <span class="text-[10px] font-medium text-[#3c315b]/40 uppercase tracking-widest -mt-0.5">
          {{ routeName }}
        </span>
      </div>
    </header> -->
    <main
      class="flex-1 overflow-auto p-6 transition-colors duration-500"
      :style="{ backgroundColor: bgColor }"
    >
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  header {
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
