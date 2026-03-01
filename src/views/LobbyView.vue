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
const roundOptions = [1, 2, 3, 4, 5]

const { startHosting, broadcast } = useHost(peerStore, gameStore)
const { joinGame } = useClient(peerStore, gameStore)

function confirmarNombre() {
  if (!playerName.value.trim()) return
  nameConfirmed.value = true

  if (peerStore.isHost) {
    gameStore.addPlayer({ id: peerStore.myId, name: playerName.value, avatar: peerStore.avatarUrl, avatarId: peerStore.avatarId })
    startHosting()
  } else {
    joinGame(hostId, { name: playerName.value, avatar: peerStore.avatarUrl, avatarId: peerStore.avatarId })
  }
}

function iniciarJuego() {
  gameStore.startGame()
  const random = Pokemons[Math.floor(Math.random() * Pokemons.length)]
  gameStore.startRound(random)
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
  <div class="flex flex-col items-center min-h-full">
    <!-- Avatar selector (solo antes de confirmar nombre) -->
    <div v-if="!nameConfirmed" class="flex-1 flex items-end justify-center pb-4">
      <img
        :src="peerStore.avatarUrl"
        alt=""
        class="w-28 h-28 rounded-full cursor-pointer active:scale-90 transition-transform duration-150"
        @click="peerStore.randomizeAvatar()"
      />
    </div>

    <!-- Spacer cuando está en espera -->
    <div v-else class="flex-1" />

    <!-- Paso 1: Nombre -->
    <div v-if="!nameConfirmed" class="flex flex-col gap-4 w-72">
      <h2 class="text-xl font-bold text-center text-white">¿Cómo te llamás?</h2>
      <input
        v-model="playerName"
        placeholder="Tu nombre"
        @keyup.enter="confirmarNombre"
        class="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white"
      />
      <button
        @click="confirmarNombre"
        class="w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition"
      >
        Confirmar
      </button>
    </div>

    <!-- Paso 2: Sala de espera -->
    <div v-else class="flex flex-col gap-6 w-72">
      <!-- Código de sala -->
      <div v-if="peerStore.isHost" class="text-center">
        <p class="text-sm text-zinc-400">Compartí este código</p>
        <p class="text-2xl font-mono font-bold tracking-widest mt-1 text-white">
          {{ peerStore.myId }}
        </p>
      </div>

      <!-- Lista de jugadores -->
      <div>
        <p class="text-sm text-zinc-400 mb-2">Jugadores ({{ gameStore.players.length }})</p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="player in gameStore.players"
            :key="player.id"
            class="flex items-center gap-2 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          >
            <div class="flex items-center gap-2">
              <img class="w-8 h-8 rounded-full" :src="player.avatar" alt="" />
              <span>
                {{ player.name }}
              </span>
              <span v-if="player.id === peerStore.myId" class="text-xs text-zinc-500 ml-auto"
                >(tú)</span
              >
            </div>
          </li>
        </ul>
      </div>

      <!-- Config + Iniciar (host) -->
      <div v-if="peerStore.isHost" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-zinc-400">Rondas:</span>
          <div class="flex gap-2">
            <button
              v-for="n in roundOptions"
              :key="n"
              @click="gameStore.setTotalRounds(n)"
              :class="[
                'px-3 py-1 text-sm rounded-lg transition',
                gameStore.totalRounds === n
                  ? 'bg-white text-black'
                  : 'border border-zinc-600 text-zinc-400 hover:text-white',
              ]"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <button
          @click="iniciarJuego"
          :disabled="!puedeIniciar"
          :class="[
            'w-full px-4 py-2 rounded-lg font-medium transition',
            puedeIniciar
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed',
          ]"
        >
          Iniciar juego
        </button>
        <p v-if="!puedeIniciar" class="text-xs text-zinc-500 text-center">
          Necesitás al menos 2 jugadores
        </p>
      </div>

      <div v-else class="text-center text-sm text-zinc-400">
        Esperando que el host inicie la partida...
      </div>
    </div>

    <!-- Spacer abajo -->
    <div class="flex-1" />
  </div>
</template>
