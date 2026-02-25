<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'

const router = useRouter()
const peerStore = usePeerStore()
const showJoinForm = ref(false)
const hostIdInput = ref('')
const inputs = ref([])

function crearSala() {
  peerStore.isHost = true
  peerStore.init()
  router.push('/lobby')
}

function irAUnirse() {
  showJoinForm.value = true
}

function unirse() {
  if (hostIdInput.value.length < 4) return
  peerStore.isHost = false
  peerStore.init()
  router.push({ path: '/lobby', query: { hostId: hostIdInput.value } })
}

function onOtpInput(index, event) {
  const val = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  event.target.value = val

  const chars = hostIdInput.value.split('')
  chars[index] = val
  hostIdInput.value = chars.join('')

  if (val && index < 3) {
    inputs.value[index + 1]?.focus()
  }
}

function onOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

function onOtpPaste(event) {
  event.preventDefault()
  const text = event.clipboardData
    .getData('text')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
  hostIdInput.value = text.padEnd(4, '')
  text.split('').forEach((char, i) => {
    if (inputs.value[i]) inputs.value[i].value = char
  })
  const focusIdx = Math.min(text.length, 3)
  inputs.value[focusIdx]?.focus()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-8">
    <!-- Branding -->
    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-4xl mb-1">🎯</p>
      <h1 class="text-3xl font-bold text-[#3c315b] tracking-tight">DexGuess</h1>
      <p class="text-sm text-[#3c315b]/55 max-w-[260px] leading-relaxed">
        Adiviná el Pokémon por su entrada del Pokédex. ¡Jugá con tus amigos!
      </p>
    </div>

    <!-- Botones principales -->
    <div v-if="!showJoinForm" class="flex flex-col gap-3 w-full max-w-[280px]">
      <button
        @click="crearSala"
        class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#7c6fd4] text-white hover:bg-[#6558c0] active:scale-95 transition-all duration-200 shadow-sm shadow-[#7c6fd4]/30"
      >
        Crear sala
      </button>
      <button
        @click="irAUnirse"
        class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white text-[#3c315b] border border-[#c4b8f5] hover:bg-[#e2dffe] active:scale-95 transition-all duration-200"
      >
        Unirse a sala
      </button>
    </div>

    <!-- Formulario para unirse -->
    <div v-else class="flex flex-col items-center gap-5 w-full max-w-[280px]">
      <div class="flex flex-col items-center gap-1 text-center">
        <p class="text-sm font-semibold text-[#3c315b]">Ingresá el código de sala</p>
        <p class="text-xs text-[#3c315b]/50">Pedíselo al host</p>
      </div>

      <div class="flex gap-3 justify-center" @paste="onOtpPaste">
        <input
          v-for="i in 4"
          :key="i"
          :ref="(el) => (inputs[i - 1] = el)"
          type="text"
          maxlength="1"
          class="w-12 h-12 text-center text-lg font-mono font-bold bg-white border-2 border-[#c4b8f5] rounded-xl text-[#3c315b] focus:outline-none focus:ring-2 focus:ring-[#7c6fd4]/30 focus:border-[#7c6fd4] uppercase transition-all duration-200"
          inputmode="text"
          @input="onOtpInput(i - 1, $event)"
          @keydown="onOtpKeydown(i - 1, $event)"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <button
          @click="unirse"
          class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#7c6fd4] text-white hover:bg-[#6558c0] active:scale-95 transition-all duration-200 shadow-sm shadow-[#7c6fd4]/30"
        >
          Unirse
        </button>
        <button
          @click="showJoinForm = false"
          class="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#3c315b]/55 hover:text-[#3c315b] hover:bg-[#3c315b]/[0.06] transition-all duration-200"
        >
          Volver
        </button>
      </div>
    </div>
  </div>
</template>
