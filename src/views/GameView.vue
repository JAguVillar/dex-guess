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
const open = ref(false)
const selected = ref(null)
const sent = ref(false)
const bouncing = ref(false)

const isHost = computed(() => peerStore.isHost)
const pokemon = computed(() => gameStore.pokemon)
const winner = computed(() => gameStore.winner)
const finished = computed(() => gameStore.status === 'finished')
const myId = computed(() => peerStore.myId)
const alreadyAnswered = computed(() => !!gameStore.answers[myId.value])
const answeredCount = computed(() => Object.keys(gameStore.answers).length)
const filtered = computed(() => {
  if (!search.value) return []
  const term = search.value.toLowerCase()
  return Pokemons.filter((p) => p.displayName.toLowerCase().includes(term)).slice(0, 10)
})

function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => {
      document.querySelector('#pokemon-search')?.focus()
    })
  }
}

function onSelect(p) {
  selected.value = p
  open.value = false
  search.value = ''
}

function onClickOutside(event) {
  if (!event.target.closest('#pokemon-dropdown')) {
    open.value = false
  }
}

function enviarRespuesta() {
  if (!selected.value || sent.value) return
  sent.value = true

  const payload = { type: 'GUESS_POKEMON', pokemonId: selected.value.id }

  if (isHost.value) {
    hostAction(payload)
  } else {
    sendAction(payload)
  }
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
  <div class="flex flex-col items-center justify-center h-full gap-6" @click="onClickOutside">
    <!-- Jugando -->
    <div v-if="!finished" class="flex flex-col items-center gap-4 w-full max-w-[300px]">
      <h2 class="text-xl font-bold text-center text-[#3c315b]">¿Quién es ese Pokémon?</h2>

      <p class="text-xs text-[#3c315b]/50 text-center">
        {{ gameStore.players.map((p) => p.name).join(' · ') }}
      </p>

      <!-- Entrada del Pokédex -->
      <div class="w-full bg-white/70 border border-[#c4b8f5]/60 rounded-2xl px-4 py-4">
        <p class="text-sm text-center italic leading-relaxed text-[#3c315b]/75">
          {{ pokemon?.dexEntry }}
        </p>
      </div>

      <!-- Ya respondió, esperando al resto -->
      <div
        v-if="alreadyAnswered"
        class="w-full text-center bg-white/70 border border-[#c4b8f5]/60 rounded-2xl px-4 py-4"
      >
        <p class="font-bold text-[#3c315b]">¡Respuesta enviada!</p>
        <p class="text-sm text-[#3c315b]/55 mt-1">
          Esperando... ({{ answeredCount }}/{{ gameStore.players.length }})
        </p>
      </div>

      <!-- Todavía puede responder -->
      <template v-else>
        <div id="pokemon-dropdown" class="relative w-full">
          <button
            @click.stop="toggleDropdown"
            class="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-[#c4b8f5] rounded-xl text-sm hover:border-[#7c6fd4] transition-all duration-200"
          >
            <span :class="selected ? 'text-[#3c315b] font-medium' : 'text-[#3c315b]/40'">
              {{ selected ? selected.displayName : 'Elegí un Pokémon...' }}
            </span>
            <svg
              class="w-4 h-4 text-[#3c315b]/35 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 10l5 5 5-5"
              />
            </svg>
          </button>

          <div
            v-if="open"
            class="absolute z-50 mt-1 w-full bg-white border border-[#c4b8f5] rounded-xl shadow-lg shadow-[#3c315b]/10 overflow-hidden"
          >
            <input
              id="pokemon-search"
              v-model="search"
              placeholder="Buscar pokémon..."
              class="w-full px-3 py-2.5 border-b border-[#c4b8f5]/60 text-sm text-[#3c315b] placeholder:text-[#3c315b]/40 focus:outline-none"
            />
            <div class="max-h-48 overflow-y-auto">
              <p v-if="search && filtered.length === 0" class="px-3 py-2.5 text-sm text-[#3c315b]/50">
                No se encontró ningún Pokémon.
              </p>
              <button
                v-for="p in filtered"
                :key="p.id"
                @click="onSelect(p)"
                class="w-full flex items-center px-3 py-2.5 text-sm text-[#3c315b] hover:bg-[#e2dffe] transition-colors text-left"
              >
                {{ p.displayName }}
                <svg
                  v-if="selected?.id === p.id"
                  class="ml-auto w-4 h-4 text-[#7c6fd4] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button
          @click="enviarRespuesta"
          :disabled="!selected"
          class="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#7c6fd4] text-white hover:bg-[#6558c0] active:scale-95 transition-all duration-200 shadow-sm shadow-[#7c6fd4]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
        >
          Enviar respuesta
        </button>
      </template>
    </div>

    <!-- Resultado -->
    <div v-else class="flex flex-col items-center gap-4 text-center w-full max-w-[280px]">
      <div class="bg-white/70 border border-[#c4b8f5]/60 rounded-2xl px-6 py-6 w-full flex flex-col items-center gap-3">
        <img
          v-if="pokemon?.sprite"
          :src="pokemon.sprite"
          :class="['w-28 h-28 cursor-pointer drop-shadow-md', { bounce: bouncing }]"
          @click="triggerBounce"
          @touchstart.prevent="triggerBounce"
          @animationend="bouncing = false"
        />
        <p class="text-lg font-bold text-[#3c315b]">{{ pokemon?.displayName }}</p>
      </div>

      <template v-if="winner">
        <p class="text-4xl">🏆</p>
        <h2 class="text-2xl font-bold text-[#3c315b]">{{ winner.name }} ganó!</h2>
      </template>
      <template v-else>
        <p class="text-4xl">😵</p>
        <h2 class="text-2xl font-bold text-[#3c315b]">¡Nadie adivinó!</h2>
      </template>

      <button
        @click="volverAlInicio"
        class="w-full mt-1 px-4 py-3 rounded-xl text-sm font-semibold bg-[#7c6fd4] text-white hover:bg-[#6558c0] active:scale-95 transition-all duration-200 shadow-sm shadow-[#7c6fd4]/30"
      >
        Volver al inicio
      </button>
    </div>
  </div>
</template>
