<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'
import { useGameStore } from '@/stores/gameStore'
import { useHost } from '@/composables/useHost'
import { useClient } from '@/composables/useClient'
import Pokemons from '@/assets/pokemon-compact.json'

const router = useRouter()
const peerStore = usePeerStore()
const gameStore = useGameStore()

const { broadcast, hostAction } = useHost(peerStore, gameStore)
const { sendAction } = useClient(peerStore, gameStore)

const search = ref('')
const dropdownOpen = ref(false)
const selected = ref(null)
const bouncing = ref(false)

const isHost = computed(() => peerStore.isHost)
const myId = computed(() => peerStore.myId)
const pokemon = computed(() => gameStore.pokemon)
const alreadyAnswered = computed(() => !!gameStore.answers[myId.value])
const answeredCount = computed(() => Object.keys(gameStore.answers).length)
const isPlaying = computed(() => gameStore.status === 'playing')
const isRoundResult = computed(() => gameStore.status === 'round_result')
const isFinished = computed(() => gameStore.status === 'finished')

const filtered = computed(() => {
  if (!search.value) return []
  const term = search.value.toLowerCase()
  return Pokemons.filter((p) => p.displayName.toLowerCase().includes(term)).slice(0, 10)
})

const scoreboard = computed(() => [...gameStore.players].sort((a, b) => b.score - a.score))

function onSelect(p) {
  selected.value = p
  search.value = p.displayName
  dropdownOpen.value = false
}

function enviarRespuesta() {
  if (!selected.value || alreadyAnswered.value) return

  const payload = { type: 'GUESS_POKEMON', pokemonId: selected.value.id }

  if (isHost.value) {
    hostAction(payload)
  } else {
    sendAction(payload)
  }
}

function siguienteRonda() {
  const random = Pokemons[Math.floor(Math.random() * Pokemons.length)]
  gameStore.startRound(random)
  broadcast({ type: 'STATE_UPDATE', state: gameStore.state })
  selected.value = null
  search.value = ''
}

function volverAlInicio() {
  gameStore.$reset()
  peerStore.destroy()
  router.push('/')
}

async function triggerBounce() {
  bouncing.value = false
  await nextTick()
  bouncing.value = true
}
</script>

<template>
  <div class="flex flex-col items-center min-h-full px-6">
    <!-- ═══ PLAYING ═══ -->
    <template v-if="isPlaying">
      <!-- Round indicator bar -->
      <div
        class="w-full max-w-[350px] flex items-center justify-between px-6 py-3 rounded-2xl"
        :style="{ background: 'var(--bg-surface)' }"
      >
        <span class="text-[13px] font-semibold" :style="{ color: 'var(--text-secondary)' }">
          Ronda {{ gameStore.round }} de {{ gameStore.totalRounds }}
        </span>
        <!-- Clock icon (decorative) -->
        <div class="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :style="{ color: 'var(--text-secondary)' }"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>

      <!-- Question area -->
      <div class="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-[350px]">
        <!-- Help circle icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{ color: 'var(--accent-soft)' }"
          style="color: rgba(255, 107, 107, 0.3)"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <h2 class="text-2xl font-bold text-center" :style="{ color: 'var(--text-primary)' }">
          ¿Quién es ese Pokémon?
        </h2>

        <!-- Dex entry card -->
        <div
          class="w-full rounded-[20px] p-6"
          :style="{ background: 'var(--bg-surface)' }"
        >
          <p
            class="text-[15px] leading-[1.6] text-center italic"
            :style="{ color: 'var(--text-secondary)' }"
          >
            {{ pokemon?.dexEntry }}
          </p>
        </div>

        <!-- Already answered -->
        <div v-if="alreadyAnswered" class="text-center">
          <p class="font-bold" :style="{ color: 'var(--text-primary)' }">¡Respuesta enviada!</p>
          <p class="text-sm" :style="{ color: 'var(--text-tertiary)' }">
            Esperando al resto ({{ answeredCount }}/{{ gameStore.players.length }})...
          </p>
        </div>
      </div>

      <!-- Search + submit -->
      <div v-if="!alreadyAnswered" class="flex flex-col gap-3 w-full max-w-[350px] pb-2">
        <div class="relative w-full">
          <input
            v-model="search"
            @focus="dropdownOpen = true"
            @input="dropdownOpen = true"
            placeholder="Buscar pokémon..."
            class="w-full h-[52px] px-4 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition-all duration-200"
            :style="{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }"
          />

          <!-- Dropdown (opens upward) -->
          <div
            v-if="dropdownOpen && filtered.length"
            class="absolute z-10 bottom-full mb-1 w-full rounded-2xl max-h-48 overflow-y-auto"
            :style="{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
            }"
          >
            <button
              v-for="p in filtered"
              :key="p.id"
              @click="onSelect(p)"
              class="w-full text-left px-3 py-2 transition text-sm"
              :style="{
                color: selected?.id === p.id ? '#14B8A6' : 'var(--text-primary)',
              }"
            >
              <div class="flex items-center gap-2">
                <img class="w-8 h-8" :src="p.sprite" alt="" />
                <span>{{ p.displayName }}</span>
              </div>
            </button>
          </div>

          <div
            v-else-if="dropdownOpen && search && !filtered.length"
            class="absolute z-10 bottom-full mb-1 w-full rounded-2xl px-3 py-2 text-sm"
            :style="{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-tertiary)',
            }"
          >
            No se encontró ningún Pokémon.
          </div>
        </div>

        <button
          @click="enviarRespuesta"
          :disabled="!selected"
          class="w-full h-[52px] rounded-2xl text-base font-semibold transition-all duration-200"
          :style="{
            background: selected ? '#FF6B6B' : 'var(--bg-elevated)',
            color: selected ? 'white' : 'var(--text-muted)',
            cursor: selected ? 'pointer' : 'not-allowed',
          }"
        >
          Enviar respuesta
        </button>
      </div>
    </template>

    <!-- ═══ ROUND RESULT ═══ -->
    <template v-else-if="isRoundResult">
      <div class="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-[350px] text-center">
        <p class="text-sm font-semibold" :style="{ color: 'var(--text-secondary)' }">
          Ronda {{ gameStore.round }} / {{ gameStore.totalRounds }}
        </p>

        <!-- Pokemon reveal -->
        <img
          v-if="gameStore.roundResult?.pokemon?.sprite"
          :src="gameStore.roundResult.pokemon.sprite"
          :class="['w-[120px] h-[120px] cursor-pointer', { bounce: bouncing }]"
          @click="triggerBounce"
          @touchstart.prevent="triggerBounce"
          @animationend="bouncing = false"
        />
        <p class="text-[22px] font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ gameStore.roundResult?.pokemon?.displayName }}
        </p>

        <p v-if="gameStore.roundResult?.correctPlayers?.length" class="font-bold text-[#14B8A6]">
          ¡Acertaron: {{ gameStore.roundResult.correctPlayers.join(', ') }}!
        </p>
        <p v-else class="font-bold text-[#FF6B6B]">¡Nadie adivinó!</p>

        <!-- Scoreboard -->
        <div class="w-full text-left">
          <p class="text-[13px] font-semibold mb-3" :style="{ color: 'var(--text-secondary)' }">
            Puntuaciones:
          </p>
          <div class="h-px mb-2" :style="{ background: 'var(--bg-elevated)' }"></div>
          <div
            v-for="p in scoreboard"
            :key="p.id"
            class="flex items-center justify-between px-3 py-2"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-8 h-8 rounded-full"
                :src="p.avatar"
                alt=""
                :style="{ background: 'var(--bg-surface)' }"
              />
              <span class="text-[15px] font-semibold" :style="{ color: 'var(--text-primary)' }">
                {{ p.name }}
              </span>
            </div>
            <span class="text-base font-bold" :style="{ color: 'var(--text-primary)' }">
              {{ p.score }} pts
            </span>
          </div>
        </div>

        <button
          v-if="isHost"
          @click="siguienteRonda"
          class="w-full h-[52px] rounded-2xl text-base font-semibold bg-[#FF6B6B] text-white hover:bg-[#e55a5a] transition-all duration-200 mt-2"
        >
          Siguiente ronda
        </button>
        <p v-else class="text-sm" :style="{ color: 'var(--text-tertiary)' }">
          Esperando al host...
        </p>
      </div>
    </template>

    <!-- ═══ FINISHED ═══ -->
    <template v-else-if="isFinished">
      <div class="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-[350px] text-center">
        <!-- Pokemon reveal -->
        <img
          v-if="gameStore.roundResult?.pokemon?.sprite"
          :src="gameStore.roundResult.pokemon.sprite"
          :class="['w-[120px] h-[120px] cursor-pointer', { bounce: bouncing }]"
          @click="triggerBounce"
          @touchstart.prevent="triggerBounce"
          @animationend="bouncing = false"
        />
        <p class="text-[22px] font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ gameStore.roundResult?.pokemon?.displayName }}
        </p>

        <!-- Trophy icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FBBF24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>

        <h2 class="text-xl font-bold" :style="{ color: 'var(--text-primary)' }">
          {{
            gameStore
              .getWinners()
              .map((w) => w.name)
              .join(', ')
          }}
          {{ gameStore.getWinners().length > 1 ? 'empatan!' : 'gana!' }}
        </h2>

        <!-- Final scoreboard -->
        <div class="w-full text-left">
          <p class="text-[13px] font-semibold mb-3" :style="{ color: 'var(--text-secondary)' }">
            Resultado final:
          </p>
          <div class="h-px mb-2" :style="{ background: 'var(--bg-elevated)' }"></div>
          <div
            v-for="(p, i) in scoreboard"
            :key="p.id"
            class="flex items-center justify-between px-3 py-2"
          >
            <div class="flex items-center gap-3">
              <!-- Medal icon -->
              <svg
                v-if="i < 3"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="i === 0 ? '#FBBF24' : i === 1 ? '#A1A1AA' : '#D97706'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              <img
                class="w-8 h-8 rounded-full"
                :src="p.avatar"
                alt=""
                :style="{ background: 'var(--bg-surface)' }"
              />
              <span class="text-[15px] font-semibold" :style="{ color: 'var(--text-primary)' }">
                {{ p.name }}
              </span>
            </div>
            <span class="text-base font-bold" :style="{ color: 'var(--text-primary)' }">
              {{ p.score }} pts
            </span>
          </div>
        </div>

        <button
          @click="volverAlInicio"
          class="w-full h-[52px] rounded-2xl text-base font-semibold transition-all duration-200 mt-4"
          :style="{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }"
        >
          Volver al inicio
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes pokemon-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.bounce {
  animation: pokemon-bounce 0.3s ease-in-out 3;
}
</style>
