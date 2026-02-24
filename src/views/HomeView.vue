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
  <div class="flex flex-col items-center justify-center h-full gap-4">
    <div v-if="!showJoinForm" class="flex flex-col gap-4">
      <Button variant="outline" @click="crearSala" class="w-48">Crear sala (Host)</Button>
      <Button variant="outline" @click="irAUnirse" class="w-48">Unirse a sala</Button>
    </div>

    <div v-else class="flex flex-col gap-4">
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
      <!-- <input`
        v-model="hostIdInput"
        placeholder="Código de sala"
        class="border rounded px-3 py-2 w-64"
      /> -->
      <Button @click="unirse" class="w-48">Unirse</Button>
      <Button variant="ghost" @click="showJoinForm = false" class="w-48">Volver</Button>
    </div>
  </div>
</template>
