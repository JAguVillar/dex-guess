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
    gameStore.addPlayer({
      id: peerStore.myId,
      name: playerName.value,
      avatar: peerStore.avatarUrl,
    })
    startHosting()
  } else {
    joinGame(hostId, {
      name: playerName.value,
      avatar: peerStore.avatarUrl,
    })
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
    <div v-if="!nameConfirmed" class="flex flex-col gap-4 w-full max-w-[280px]">
      <div class="flex justify-center">
        <img
          :src="peerStore.avatarUrl"
          alt=""
          class="w-28 h-28 rounded-full cursor-pointer active:scale-90 transition-transform duration-150"
          @click="peerStore.randomizeAvatar()"
        />
      </div>
      <h2 class="text-xl font-bold text-center text-[#e2dffe]">¿Cómo te llamás?</h2>
      <input
        v-model="playerName"
        placeholder="Tu nombre..."
        @keyup.enter="confirmarNombre"
        class="w-full px-3 py-2.5 bg-[#28282c] border border-[#ab9ff2]/30 rounded-xl text-sm text-[#e2dffe] placeholder:text-[#e2dffe]/35 focus:outline-none focus:ring-2 focus:ring-[#ab9ff2]/40 focus:border-[#ab9ff2] transition-all duration-200"
      />
      <button
        @click="confirmarNombre"
        class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#ab9ff2] text-[#3c315b] hover:bg-[#e2dffe] active:scale-95 transition-all duration-200"
      >
        Confirmar
      </button>
    </div>

    <!-- PASO 2: Sala de espera -->
    <div v-else class="flex flex-col gap-5 w-full max-w-70">
      <!-- Código del host -->
      <div
        v-if="peerStore.isHost"
        class="text-center bg-[#28282c] border border-[#ab9ff2]/20 rounded-2xl px-4 py-4"
      >
        <p class="text-[10px] font-medium text-[#e2dffe]/50 uppercase tracking-widest mb-2">
          Compartí este código
        </p>
        <p class="text-3xl font-mono font-bold tracking-[0.2em] text-[#ab9ff2]">
          {{ peerStore.myId }}
        </p>
      </div>

      <!-- Lista de jugadores -->
      <div>
        <p class="text-[10px] font-medium text-[#e2dffe]/50 uppercase tracking-widest mb-2">
          Jugadores ({{ gameStore.players.length }})
        </p>
        <ul class="flex flex-col gap-2 w-full">
          <li
            v-for="player in gameStore.players"
            :key="player.id"
            class="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-[#28282c] border border-[#ab9ff2]/15"
          >
            <img :src="player.avatar" alt="" class="w-8 h-8 rounded-full" />
            <span class="text-sm font-medium text-[#e2dffe]">{{ player.name }}</span>
            <span v-if="player.id === peerStore.myId" class="text-xs text-[#e2dffe]/35 ml-auto">
              (tú)
            </span>
          </li>
        </ul>
      </div>

      <!-- Botón iniciar (solo host) -->
      <div v-if="peerStore.isHost">
        <button
          @click="iniciarJuego"
          :disabled="!puedeIniciar"
          class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#ab9ff2] text-[#3c315b] hover:bg-[#e2dffe] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Iniciar juego
        </button>
        <p v-if="!puedeIniciar" class="text-xs text-[#e2dffe]/45 text-center mt-2">
          Necesitás al menos 2 jugadores
        </p>
      </div>

      <!-- Esperando (no host) -->
      <div v-else class="text-center text-sm text-[#e2dffe]/50">
        Esperando que el host inicie la partida...
      </div>
    </div>
  </div>
</template>
