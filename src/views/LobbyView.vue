<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'
import { useGameStore } from '@/stores/gameStore'
import { useHost } from '@/composables/useHost'
import { useClient } from '@/composables/useClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Pokemons from '@/assets/pokemon-compact.json'

const route = useRoute()
const router = useRouter()
const peerStore = usePeerStore()
const gameStore = useGameStore()

const playerName = ref('')
const nameConfirmed = ref(false)
const hostId = route.query.hostId ?? null

// Inicializamos los composables correspondientes
const { startHosting, broadcast, hostAction } = useHost(peerStore, gameStore)
const { joinGame, sendAction } = useClient(peerStore, gameStore)

// ─── Al confirmar el nombre ───────────────────────────────────────────────────
function confirmarNombre() {
  if (!playerName.value.trim()) return

  nameConfirmed.value = true

  if (peerStore.isHost) {
    // El host se agrega como primer jugador y empieza a escuchar
    gameStore.addPlayer({ id: peerStore.myId, name: playerName.value })
    startHosting()
  } else {
    // El guest se conecta al host
    joinGame(hostId, { name: playerName.value })
  }
}

// ─── Solo el host puede iniciar ───────────────────────────────────────────────
function iniciarJuego() {
  const random = Pokemons[Math.floor(Math.random() * Pokemons.length)]
  gameStore.setPokemon(random)
  gameStore.startGame()
  broadcast({ type: 'GAME_START', state: gameStore.state })
  router.push('/game')
}
// ─── Escuchar GAME_START si somos guest ───────────────────────────────────────
// Esto lo maneja useClient internamente, pero necesitamos el router acá
// Por eso exponemos un callback desde el composable (ver useClient actualizado abajo)
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
  <div class="flex flex-col items-center justify-center h-full gap-6 px-4 py-8">
    <!-- PASO 1: Elegir nombre -->
    <div v-if="!nameConfirmed" class="w-full max-w-xs space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div
          class="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
          style="background: rgb(239 68 68 / 0.15)"
        >
          <svg
            class="w-8 h-8"
            style="color: #f87171"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-black text-white">¿Cómo te llamás?</h2>
        <p class="text-white/40 text-sm">Tu nombre aparecerá en la partida</p>
      </div>

      <!-- Form card -->
      <div class="glass-card rounded-2xl p-5 space-y-4">
        <Input
          v-model="playerName"
          placeholder="Nombre de entrenador..."
          @keyup.enter="confirmarNombre"
          class="h-11 text-base bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus-visible:border-red-500/50"
        />
        <Button
          @click="confirmarNombre"
          class="w-full neon-glow"
          size="lg"
        >
          Confirmar
        </Button>
      </div>
    </div>

    <!-- PASO 2: Sala de espera -->
    <div v-else class="w-full max-w-xs space-y-4">
      <!-- Código de sala (solo el host lo muestra) -->
      <div v-if="peerStore.isHost" class="glass-card rounded-2xl p-5 text-center space-y-2">
        <p class="text-xs text-white/35 uppercase tracking-widest font-semibold">Código de sala</p>
        <p
          class="text-4xl font-black font-mono tracking-[0.35em] text-gradient-gold"
          style="letter-spacing: 0.3em"
        >
          {{ peerStore.myId }}
        </p>
        <p class="text-xs text-white/25">Compartí este código con tus amigos</p>
      </div>

      <!-- Waiting indicator for guests -->
      <div v-if="!peerStore.isHost" class="glass-card rounded-2xl p-4">
        <div class="flex items-center justify-center gap-2.5 text-sm text-white/50">
          <div class="flex gap-1">
            <div
              class="w-1.5 h-1.5 rounded-full bg-yellow-400"
              style="animation: bounce 1s ease-in-out infinite; animation-delay: 0ms"
            ></div>
            <div
              class="w-1.5 h-1.5 rounded-full bg-yellow-400"
              style="animation: bounce 1s ease-in-out infinite; animation-delay: 150ms"
            ></div>
            <div
              class="w-1.5 h-1.5 rounded-full bg-yellow-400"
              style="animation: bounce 1s ease-in-out infinite; animation-delay: 300ms"
            ></div>
          </div>
          <span>Esperando al host...</span>
        </div>
      </div>

      <!-- Players list -->
      <div class="glass-card rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-white/35 uppercase tracking-wider font-semibold">Jugadores</p>
          <span
            class="text-xs font-bold text-white/50 px-2 py-0.5 rounded-full"
            style="background: rgb(255 255 255 / 0.08)"
          >
            {{ gameStore.players.length }}
          </span>
        </div>

        <ul class="space-y-2">
          <li
            v-for="player in gameStore.players"
            :key="player.id"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
            style="background: rgb(255 255 255 / 0.04)"
          >
            <!-- Avatar -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
              style="background: linear-gradient(135deg, rgb(239 68 68 / 0.4), rgb(251 146 60 / 0.4))"
            >
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-semibold text-white flex-1 truncate">{{ player.name }}</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <div class="w-1.5 h-1.5 rounded-full bg-green-400" style="animation: pulse 2s ease-in-out infinite"></div>
              <span v-if="player.id === peerStore.myId" class="text-xs text-white/25">tú</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Host action -->
      <div v-if="peerStore.isHost" class="space-y-2">
        <Button @click="iniciarJuego" :disabled="!puedeIniciar" class="w-full" size="lg">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Iniciar juego
        </Button>
        <p v-if="!puedeIniciar" class="text-xs text-white/25 text-center">
          Necesitás al menos 2 jugadores para empezar
        </p>
      </div>
    </div>
  </div>
</template>
