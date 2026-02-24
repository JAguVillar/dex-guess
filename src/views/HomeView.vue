<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'
import { Button } from '@/components/ui/button'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'vue-input-otp'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
const router = useRouter()
const peerStore = usePeerStore()
const showJoinForm = ref(false)
const hostIdInput = ref('')

function crearSala() {
  peerStore.isHost = true
  peerStore.init() // genera ID corto para el host
  router.push('/lobby')
}

function irAUnirse() {
  showJoinForm.value = true
}

function unirse() {
  if (!hostIdInput.value) return
  peerStore.isHost = false
  peerStore.init() // sin ID custom, PeerJS asigna uno automático
  router.push({ path: '/lobby', query: { hostId: hostIdInput.value } })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-8 px-4 py-8">
    <!-- Hero section -->
    <div class="text-center space-y-3">
      <!-- Pokeball hero icon -->
      <div class="flex justify-center mb-1">
        <div class="w-16 h-16 float">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <defs>
              <clipPath id="home-upper"><rect x="0" y="0" width="100" height="50" /></clipPath>
              <clipPath id="home-lower"><rect x="0" y="50" width="100" height="50" /></clipPath>
              <radialGradient id="ball-glow" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#ff6b6b" />
                <stop offset="100%" stop-color="#cc2222" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#ball-glow)" clip-path="url(#home-upper)" />
            <circle cx="50" cy="50" r="47" fill="#2d3748" clip-path="url(#home-lower)" />
            <rect x="1" y="46" width="98" height="8" fill="#0d1117" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#0d1117" stroke-width="4" />
            <circle
              cx="50"
              cy="50"
              r="14"
              fill="#0d1117"
              stroke="#374151"
              stroke-width="2"
            />
            <circle cx="50" cy="50" r="8" fill="#4b5563" />
            <circle cx="45" cy="45" r="3" fill="#6b7280" opacity="0.6" />
          </svg>
        </div>
      </div>

      <h1
        class="text-5xl font-black tracking-tight gradient-text"
        style="line-height: 1.1; letter-spacing: -0.02em"
      >
        DexGuess
      </h1>
      <p class="text-white/40 text-sm font-medium">
        ¿Podés adivinar el Pokémon por su descripción?
      </p>
    </div>

    <!-- Action cards -->
    <div v-if="!showJoinForm" class="flex flex-col gap-3 w-full max-w-xs">
      <!-- Create room -->
      <button
        @click="crearSala"
        class="group glass-card rounded-2xl p-5 text-left transition-all duration-200 hover:bg-white/[0.07] cursor-pointer"
        style="border-color: rgb(255 255 255 / 0.09)"
        onmouseenter="this.style.borderColor='rgb(239 68 68 / 0.35)'; this.style.boxShadow='0 8px 32px rgb(239 68 68 / 0.12)'"
        onmouseleave="this.style.borderColor='rgb(255 255 255 / 0.09)'; this.style.boxShadow=''"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
            style="background: rgb(239 68 68 / 0.15)"
          >
            <svg
              class="w-5 h-5"
              style="color: #f87171"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white text-sm">Crear sala</p>
            <p class="text-white/35 text-xs mt-0.5">Sé el host de la partida</p>
          </div>
          <svg
            class="w-4 h-4 text-white/15 shrink-0 transition-all duration-200 group-hover:text-red-400/50 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      <!-- Join room -->
      <button
        @click="irAUnirse"
        class="group glass-card rounded-2xl p-5 text-left transition-all duration-200 hover:bg-white/[0.07] cursor-pointer"
        style="border-color: rgb(255 255 255 / 0.09)"
        onmouseenter="this.style.borderColor='rgb(250 204 21 / 0.35)'; this.style.boxShadow='0 8px 32px rgb(250 204 21 / 0.08)'"
        onmouseleave="this.style.borderColor='rgb(255 255 255 / 0.09)'; this.style.boxShadow=''"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
            style="background: rgb(250 204 21 / 0.12)"
          >
            <svg
              class="w-5 h-5"
              style="color: #fbbf24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white text-sm">Unirse a sala</p>
            <p class="text-white/35 text-xs mt-0.5">Ingresá con un código</p>
          </div>
          <svg
            class="w-4 h-4 text-white/15 shrink-0 transition-all duration-200 group-hover:text-yellow-400/50 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>
    </div>

    <!-- Join form -->
    <div v-else class="flex flex-col gap-5 w-full max-w-xs">
      <div class="glass-card rounded-2xl p-6 space-y-5">
        <div class="text-center space-y-1">
          <p class="font-bold text-white text-sm">Código de sala</p>
          <p class="text-white/40 text-xs">Pedile el código de 4 dígitos al host</p>
        </div>

        <InputOTP
          :maxlength="4"
          v-model="hostIdInput"
          class="justify-center"
          :pattern="REGEXP_ONLY_DIGITS_AND_CHARS"
          input-mode="text"
        >
          <InputOTPGroup>
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
            <InputOTPSlot :index="2" />
            <InputOTPSlot :index="3" />
          </InputOTPGroup>
        </InputOTP>

        <Button @click="unirse" class="w-full" size="lg"> Unirse a la sala </Button>
      </div>

      <button
        @click="showJoinForm = false"
        class="text-white/35 hover:text-white/60 text-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver
      </button>
    </div>
  </div>
</template>
