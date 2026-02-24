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
  <div class="flex flex-col items-center justify-center h-full gap-6">
    <!-- PASO 1: Elegir nombre -->
    <div v-if="!nameConfirmed" class="flex flex-col gap-4 w-72">
      <h2 class="text-xl font-bold text-center">¿Cómo te llamás?</h2>
      <Input v-model="playerName" placeholder="Tu nombre" @keyup.enter="confirmarNombre" />
      <Button @click="confirmarNombre" class="w-full">Confirmar</Button>
    </div>

    <!-- PASO 2: Sala de espera -->
    <div v-else class="flex flex-col gap-6 w-72">
      <!-- Código de sala (solo el host lo muestra para compartir) -->
      <div v-if="peerStore.isHost" class="text-center">
        <p class="text-sm text-muted-foreground">Compartí este código</p>
        <p class="text-2xl font-mono font-bold tracking-widest mt-1">{{ peerStore.myId }}</p>
      </div>

      <!-- Lista de jugadores -->
      <div>
        <p class="text-sm text-muted-foreground mb-2">Jugadores ({{ gameStore.players.length }})</p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="player in gameStore.players"
            :key="player.id"
            class="flex items-center gap-2 border rounded px-3 py-2"
          >
            <span class="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            {{ player.name }}
            <span v-if="player.id === peerStore.myId" class="text-xs text-muted-foreground ml-auto">
              (tú)
            </span>
          </li>
        </ul>
      </div>

      <!-- Acción según rol -->
      <div v-if="peerStore.isHost">
        <Button @click="iniciarJuego" :disabled="!puedeIniciar" class="w-full">
          Iniciar juego
        </Button>
        <p v-if="!puedeIniciar" class="text-xs text-muted-foreground text-center mt-2">
          Necesitás al menos 2 jugadores
        </p>
      </div>

      <div v-else class="text-center text-sm text-muted-foreground">
        Esperando que el host inicie la partida...
      </div>
    </div>
  </div>
</template>
