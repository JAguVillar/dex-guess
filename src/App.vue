<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-screen">
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4" @click="router.push('/')">
      {{ router.currentRoute.value.name }}
    </header>
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
