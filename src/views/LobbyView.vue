<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'
import { useGameStore } from '@/stores/gameStore'
import { useHost } from '@/composables/useHost'
import { useClient } from '@/composables/useClient'
import Pokemons from '@/assets/pokemon-compact.json'

const route = useRoute()
const router = useRouter()
const peerStore = usePeerStore()
const gameStore = useGameStore()

const playerName = ref('')
const nameConfirmed = ref(false)
const hostId = route.query.hostId ?? null

const { startHosting, broadcast, hostAction } = useHost(peerStore, gameStore)
const { joinGame, sendAction } = useClient(peerStore, gameStore)

function confirmarNombre() {
  if (!playerName.value.trim()) return

  nameConfirmed.value = true

  if (peerStore.isHost) {
    gameStore.addPlayer({ id: peerStore.myId, name: playerName.value })
    startHosting()
  } else {
    joinGame(hostId, { name: playerName.value })
  }
}

function iniciarJuego() {
  const random = Pokemons[Math.floor(Math.random() * Pokemons.length)]
  gameStore.setPokemon(random)
  gameStore.startGame()
  broadcast({ type: 'GAME_START', state: gameStore.state })
  router.push('/game')
}

onMounted(() => {
  if (!peerStore.isHost) {
    gameStore.$subscribe((_, state) => {
      if (state.status === 'playing') {
        router.push('/game')
      }
    })
  }
})

const puedeIniciar = computed(() => gameStore.players.length >= 2)
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-6">
    <!-- PASO 1: Elegir nombre -->
    <div v-if="!nameConfirmed" class="flex flex-col gap-4 w-72">
      <h2 class="text-xl font-bold text-center text-[#fffdf8]">¿Cómo te llamás?</h2>
      <input
        v-model="playerName"
        placeholder="Tu nombre"
        @keyup.enter="confirmarNombre"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-[#E2DFFE]"
      />
      <button
        @click="confirmarNombre"
        class="w-full px-4 py-2 bg-[#E2DFFE] text-[#3c315b] rounded-xl text-sm font-semibold hover:bg-[#AB9FF2] hover:scale-95 transition-all duration-300 ease-out"
      >
        Confirmar
      </button>
    </div>

    <!-- PASO 2: Sala de espera -->
    <div v-else class="flex flex-col gap-6 w-full">
      <div v-if="peerStore.isHost" class="text-center">
        <p class="text-sm text-gray-500">Compartí este código</p>
        <p class="text-2xl font-mono font-bold tracking-widest mt-1">{{ peerStore.myId }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-500 mb-2">Jugadores ({{ gameStore.players.length }})</p>
        <ul class="flex flex-col gap-2 w-full">
          <li
            v-for="player in gameStore.players"
            :key="player.id"
            class="w-full flex items-center gap-2 rounded-lg px-3 py-2 bg-[#28282c]"
          >
            <span class="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span class="text-[#fffdf8]">
              {{ player.name }}
            </span>
            <span v-if="player.id === peerStore.myId" class="text-xs text-gray-500 ml-auto">
              (tú)
            </span>
          </li>
        </ul>
      </div>

      <div v-if="peerStore.isHost">
        <button
          @click="iniciarJuego"
          :disabled="!puedeIniciar"
          class="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iniciar juego
        </button>
        <p v-if="!puedeIniciar" class="text-xs text-gray-500 text-center mt-2">
          Necesitás al menos 2 jugadores
        </p>
      </div>

      <div v-else class="text-center text-sm text-gray-500">
        Esperando que el host inicie la partida...
      </div>
    </div>
  </div>
</template>
