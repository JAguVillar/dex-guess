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
  <div class="flex flex-col items-center justify-center h-full gap-4">
    <div v-if="!showJoinForm" class="flex flex-col gap-4 w-full">
      <button
        @click="crearSala"
        class="w-full px-4 py-2 rounded-xl text-sm font-semibold bg-[#AB9FF2] hover:bg-[#E2DFFE] hover:scale-95 transition-all duration-300 ease-out"
      >
        Crear sala (Host)
      </button>
      <button
        @click="irAUnirse"
        class="w-full px-4 py-2 rounded-xl text-sm font-semibold bg-[#AB9FF2] hover:bg-[#E2DFFE] hover:scale-95 transition-all duration-300 ease-out"
      >
        Unirse a sala
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-4">
      <div class="flex gap-2 justify-center" @paste="onOtpPaste">
        <input
          v-for="i in 4"
          :key="i"
          :ref="(el) => (inputs[i - 1] = el)"
          type="text"
          maxlength="1"
          class="w-12 h-12 text-center text-lg font-mono font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 uppercase"
          inputmode="text"
          @input="onOtpInput(i - 1, $event)"
          @keydown="onOtpKeydown(i - 1, $event)"
        />
      </div>
      <button
        @click="unirse"
        class="w-48 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 hover:scale-95 transition-transform"
      >
        Unirse
      </button>
      <button
        @click="showJoinForm = false"
        class="w-48 px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
      >
        Volver
      </button>
    </div>
  </div>
</template>
