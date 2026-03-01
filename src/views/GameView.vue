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
  router.push('/')
}

async function triggerBounce() {
  bouncing.value = false
  await nextTick()
  bouncing.value = true
}
</script>

<template>
  <div class="flex flex-col items-center min-h-full">
    <!-- ═══ JUGANDO ═══ -->
    <template v-if="isPlaying">
      <!-- Arriba: vacío -->
      <div class="flex flex-wrap justify-center gap-1 max-w-80 px-2 pt-2">
        <img
          v-for="r in gameStore.totalRounds"
          :key="r"
          :src="
            r < gameStore.round && gameStore.pokemons[r - 1]?.sprite
              ? gameStore.pokemons[r - 1].sprite
              : 'https://images.wikidexcdn.net/mwuploads/wikidex/4/48/latest/20080731164835/Unown_%3F_RZ.png'
          "
          alt=""
          :class="[
            'w-auto transition-all',
            gameStore.totalRounds <= 5 ? 'h-14' : gameStore.totalRounds <= 10 ? 'h-10' : 'h-8',
          ]"
        />
      </div>
      <!-- Medio: dex entry + ronda -->
      <div class="flex-1 flex flex-col items-center justify-center gap-4 w-80">
        <!-- <p class="text-sm text-zinc-400">
          Ronda {{ gameStore.round }} / {{ gameStore.totalRounds }}
        </p> -->
        <h2 class="text-xl font-bold text-center text-white">¿Quién es ese Pokémon?</h2>
        <p class="text-sm text-center italic text-zinc-300">{{ pokemon?.dexEntry }}</p>

        <!-- Ya respondió -->
        <div v-if="alreadyAnswered" class="text-center">
          <p class="font-bold text-white">¡Respuesta enviada!</p>
          <p class="text-sm text-zinc-400">
            Esperando al resto ({{ answeredCount }}/{{ gameStore.players.length }})...
          </p>
        </div>
      </div>

      <!-- Abajo: dropdown + botón -->
      <div v-if="!alreadyAnswered" class="flex flex-col gap-3 w-80 pb-2">
        <div class="relative w-full">
          <input
            v-model="search"
            @focus="dropdownOpen = true"
            @input="dropdownOpen = true"
            placeholder="Buscar pokémon..."
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white"
          />

          <!-- Dropdown (abre hacia arriba) -->
          <div
            v-if="dropdownOpen && filtered.length"
            class="absolute z-10 bottom-full mb-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto"
          >
            <button
              v-for="p in filtered"
              :key="p.id"
              @click="onSelect(p)"
              :class="[
                'w-full text-left px-3 py-2 hover:bg-zinc-800 transition text-sm',
                selected?.id === p.id ? 'text-green-400' : 'text-white',
              ]"
            >
              <div class="flex items-center gap-2">
                <img class="w-8 h-8" :src="p.sprite" alt="" />
                <span>{{ p.displayName }}</span>
              </div>
            </button>
          </div>

          <div
            v-else-if="dropdownOpen && search && !filtered.length"
            class="absolute z-10 bottom-full mb-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-500"
          >
            No se encontró ningún Pokémon.
          </div>
        </div>

        <button
          @click="enviarRespuesta"
          :disabled="!selected"
          :class="[
            'w-full px-4 py-2 rounded-lg font-medium transition',
            selected
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed',
          ]"
        >
          Enviar respuesta
        </button>
      </div>
    </template>

    <!-- ═══ RESULTADO DE RONDA ═══ -->
    <template v-else-if="isRoundResult">
      <div class="flex-1 flex flex-col items-center justify-center gap-4 w-80 text-center">
        <p class="text-sm text-zinc-400">
          Ronda {{ gameStore.round }} / {{ gameStore.totalRounds }}
        </p>
        <img
          v-if="gameStore.roundResult?.pokemon?.sprite"
          :src="gameStore.roundResult.pokemon.sprite"
          :class="['w-32 h-32 cursor-pointer', { bounce: bouncing }]"
          @click="triggerBounce"
          @touchstart.prevent="triggerBounce"
          @animationend="bouncing = false"
        />
        <p class="text-lg font-bold text-white">
          {{ gameStore.roundResult?.pokemon?.displayName }}
        </p>

        <p v-if="gameStore.roundResult?.correctPlayers?.length" class="text-green-400 font-bold">
          ¡Acertaron: {{ gameStore.roundResult.correctPlayers.join(', ') }}!
        </p>
        <p v-else class="text-red-400 font-bold">¡Nadie adivinó!</p>

        <!-- Scoreboard -->
        <div class="w-full text-left">
          <p class="text-sm text-zinc-400 mb-2">Puntuaciones:</p>
          <div
            v-for="p in scoreboard"
            :key="p.id"
            class="flex justify-between px-2 py-1 text-white"
          >
            <span>{{ p.name }}</span>
            <span class="font-bold">{{ p.score }} pts</span>
          </div>
        </div>

        <button
          v-if="isHost"
          @click="siguienteRonda"
          class="w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition mt-2"
        >
          Siguiente ronda
        </button>
        <p v-else class="text-sm text-zinc-400">Esperando al host...</p>
      </div>
    </template>

    <!-- ═══ FIN DEL JUEGO ═══ -->
    <template v-else-if="isFinished">
      <div class="flex-1 flex flex-col items-center justify-center gap-4 w-80 text-center">
        <img
          v-if="gameStore.roundResult?.pokemon?.sprite"
          :src="gameStore.roundResult.pokemon.sprite"
          :class="['w-32 h-32 cursor-pointer', { bounce: bouncing }]"
          @click="triggerBounce"
          @touchstart.prevent="triggerBounce"
          @animationend="bouncing = false"
        />
        <p class="text-lg font-bold text-white">
          {{ gameStore.roundResult?.pokemon?.displayName }}
        </p>

        <p class="text-4xl">🏆</p>
        <h2 class="text-2xl font-bold text-white">
          {{
            gameStore
              .getWinners()
              .map((w) => w.name)
              .join(', ')
          }}
          {{ gameStore.getWinners().length > 1 ? 'empatan!' : 'gana!' }}
        </h2>

        <!-- Scoreboard final -->
        <div class="w-full text-left">
          <p class="text-sm text-zinc-400 mb-2">Resultado final:</p>
          <div
            v-for="(p, i) in scoreboard"
            :key="p.id"
            class="flex justify-between px-2 py-1 text-white"
          >
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2">
                <span v-if="i === 0">🥇 </span>
                <span v-else-if="i === 1">🥈</span>
                <span v-else-if="i === 2">🥉</span>
                <img class="w-8 h-8 rounded-full" :src="p.avatar" alt="" />
                <span>
                  {{ p.name }}
                </span>
              </div>
            </div>
            <span class="font-bold">{{ p.score }} pts</span>
          </div>
        </div>

        <button
          @click="volverAlInicio"
          class="w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition mt-4"
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
