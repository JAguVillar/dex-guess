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
  <div class="flex flex-col items-center min-h-full px-6">
    <!-- ═══ STAGE 1: Enter Name ═══ -->
    <template v-if="!nameConfirmed">
      <div class="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-[350px]">
        <!-- Avatar -->
        <img
          :src="peerStore.avatarUrl"
          alt=""
          class="w-[120px] h-[120px] rounded-full cursor-pointer active:scale-90 transition-transform duration-150"
          :style="{ background: 'var(--bg-surface)' }"
          @click="peerStore.randomizeAvatar()"
        />

        <!-- Name block -->
        <div class="flex flex-col items-center gap-4 w-full">
          <h2
            class="text-2xl font-bold text-center"
            :style="{ color: 'var(--text-primary)' }"
          >
            ¿Cómo te llamás?
          </h2>
          <input
            v-model="playerName"
            placeholder="Tu nombre..."
            @keyup.enter="confirmarNombre"
            class="w-full h-[52px] px-4 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition-all duration-200"
            :style="{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }"
          />
        </div>

        <!-- Confirm button -->
        <button
          @click="confirmarNombre"
          class="w-full h-[52px] rounded-2xl text-base font-semibold bg-[#FF6B6B] text-white hover:bg-[#e55a5a] active:scale-95 transition-all duration-200"
        >
          Confirmar
        </button>
      </div>
    </template>

    <!-- ═══ STAGE 2: Lobby Waiting ═══ -->
    <template v-else>
      <div class="flex flex-col gap-7 w-full max-w-[350px] pt-8 pb-6 flex-1">
        <!-- Code section (host only) -->
        <div
          v-if="peerStore.isHost"
          class="flex flex-col items-center gap-2 py-6 rounded-[20px]"
          :style="{ background: 'var(--bg-surface)' }"
        >
          <p class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">
            Compartí este código
          </p>
          <p
            class="text-[40px] font-extrabold tracking-[4px]"
            :style="{ color: 'var(--text-primary)' }"
          >
            {{ peerStore.myId }}
          </p>
        </div>

        <!-- Players section -->
        <div class="flex flex-col gap-3">
          <p class="text-[13px] font-semibold" :style="{ color: 'var(--text-secondary)' }">
            Jugadores ({{ gameStore.players.length }})
          </p>
          <div class="h-px" :style="{ background: 'var(--bg-elevated)' }"></div>
          <div
            v-for="player in gameStore.players"
            :key="player.id"
            class="flex items-center gap-3 py-2 px-3"
          >
            <img
              class="w-9 h-9 rounded-full"
              :src="player.avatar"
              alt=""
              :style="{ background: 'var(--bg-surface)' }"
            />
            <div class="flex items-center gap-1.5">
              <span class="text-[15px] font-semibold" :style="{ color: 'var(--text-primary)' }">
                {{ player.name }}
              </span>
              <span
                v-if="player.id === peerStore.myId"
                class="text-[13px]"
                :style="{ color: 'var(--text-tertiary)' }"
              >
                (tú)
              </span>
            </div>
          </div>
        </div>

        <!-- Host controls -->
        <div v-if="peerStore.isHost" class="flex flex-col gap-3">
          <!-- Round selector -->
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">
              Rondas:
            </span>
            <div class="flex gap-2">
              <button
                v-for="n in roundOptions"
                :key="n"
                @click="gameStore.setTotalRounds(n)"
                class="w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200"
                :style="{
                  background: gameStore.totalRounds === n ? '#FF6B6B' : 'var(--bg-surface)',
                  color: gameStore.totalRounds === n ? 'white' : 'var(--text-primary)',
                }"
              >
                {{ n }}
              </button>
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Start button (host) -->
        <div v-if="peerStore.isHost" class="flex flex-col gap-2">
          <button
            @click="iniciarJuego"
            :disabled="!puedeIniciar"
            class="w-full h-[52px] rounded-2xl text-base font-semibold transition-all duration-200"
            :style="{
              background: puedeIniciar ? '#FF6B6B' : 'var(--bg-elevated)',
              color: puedeIniciar ? 'white' : 'var(--text-muted)',
              cursor: puedeIniciar ? 'pointer' : 'not-allowed',
            }"
          >
            Iniciar juego
          </button>
          <p
            v-if="!puedeIniciar"
            class="text-xs text-center"
            :style="{ color: 'var(--text-tertiary)' }"
          >
            Necesitás al menos 2 jugadores
          </p>
        </div>

        <!-- Client waiting message -->
        <div v-else class="text-center text-sm" :style="{ color: 'var(--text-tertiary)' }">
          Esperando que el host inicie la partida...
        </div>
      </div>
    </template>
  </div>
</template>
