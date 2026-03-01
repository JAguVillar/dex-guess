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
  <div class="flex flex-col items-center justify-center min-h-full gap-6 px-6">
    <!-- Hero illustration -->
    <div
      class="w-[200px] h-[200px] rounded-full overflow-hidden flex items-center justify-center"
      :style="{ background: 'var(--bg-surface)' }"
    >
      <img :src="peerStore.avatarUrl" alt="" class="w-[160px] h-[160px] object-contain" />
    </div>

    <!-- Title block -->
    <div class="flex flex-col items-center gap-3 text-center">
      <h1
        class="text-[34px] font-extrabold tracking-tight"
        :style="{ color: 'var(--text-primary)' }"
      >
        DexGuess
      </h1>
      <p
        class="text-[15px] leading-relaxed max-w-[280px]"
        :style="{ color: 'var(--text-secondary)' }"
      >
        Adiviná el Pokémon por su entrada del Pokédex. ¡Jugá con tus amigos!
      </p>
    </div>

    <!-- Spacer -->
    <div class="h-10"></div>

    <!-- Main buttons -->
    <div v-if="!showJoinForm" class="flex flex-col gap-3 w-full max-w-[350px]">
      <button
        @click="crearSala"
        class="w-full h-[52px] rounded-2xl text-base font-semibold bg-[#FF6B6B] text-white hover:bg-[#e55a5a] active:scale-95 transition-all duration-200"
      >
        Crear sala
      </button>
      <button
        @click="irAUnirse"
        class="w-full h-[52px] rounded-2xl text-base font-semibold active:scale-95 transition-all duration-200"
        :style="{
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }"
      >
        Unirse a sala
      </button>
    </div>

    <!-- Join form -->
    <div v-else class="flex flex-col items-center gap-5 w-full max-w-[350px]">
      <div class="flex flex-col items-center gap-1 text-center">
        <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
          Ingresá el código de sala
        </p>
        <p class="text-xs" :style="{ color: 'var(--text-tertiary)' }">Pedíselo al host</p>
      </div>

      <div class="flex gap-3 justify-center" @paste="onOtpPaste">
        <input
          v-for="i in 4"
          :key="i"
          :ref="(el) => (inputs[i - 1] = el)"
          type="text"
          maxlength="1"
          class="w-12 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 uppercase transition-all duration-200 focus:outline-none focus:border-[#FF6B6B]"
          :style="{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border)',
          }"
          inputmode="text"
          @input="onOtpInput(i - 1, $event)"
          @keydown="onOtpKeydown(i - 1, $event)"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <button
          @click="unirse"
          class="w-full h-[52px] rounded-2xl text-base font-semibold bg-[#FF6B6B] text-white hover:bg-[#e55a5a] active:scale-95 transition-all duration-200"
        >
          Unirse
        </button>
        <button
          @click="showJoinForm = false"
          class="w-full h-11 rounded-2xl text-sm font-medium transition-all duration-200"
          :style="{ color: 'var(--text-tertiary)' }"
        >
          Volver
        </button>
      </div>
    </div>
  </div>
</template>
