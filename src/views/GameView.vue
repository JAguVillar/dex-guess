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
    <div v-if="!finished" class="flex flex-col items-center gap-4 w-80">
      <h2 class="text-xl font-bold text-center">¿Quién es ese Pokémon?</h2>

      <p class="text-sm text-gray-500">
        Jugadores: {{ gameStore.players.map((p) => p.name).join(', ') }}
      </p>

      <p class="text-sm text-center italic">{{ pokemon?.dexEntry }}</p>

      <!-- Ya respondió, esperando al resto -->
      <div v-if="alreadyAnswered" class="text-center">
        <p class="font-bold">¡Respuesta enviada!</p>
        <p class="text-sm text-gray-500">
          Esperando al resto ({{ answeredCount }}/{{ gameStore.players.length }})...
        </p>
      </div>

      <!-- Todavía puede responder -->
      <template v-else>
        <div id="pokemon-dropdown" class="relative w-full">
          <button
            @click="toggleDropdown"
            class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <span :class="selected ? 'text-gray-900' : 'text-gray-500'">
              {{ selected ? selected.displayName : 'Elegí un Pokémon...' }}
            </span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5" />
            </svg>
          </button>

          <div
            v-if="open"
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <input
              id="pokemon-search"
              v-model="search"
              placeholder="Buscar pokémon..."
              class="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
            />
            <div class="max-h-48 overflow-y-auto">
              <p v-if="search && filtered.length === 0" class="px-3 py-2 text-sm text-gray-500">
                No se encontró ningún Pokémon.
              </p>
              <button
                v-for="p in filtered"
                :key="p.id"
                @click="onSelect(p)"
                class="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors text-left"
              >
                {{ p.displayName }}
                <svg
                  v-if="selected?.id === p.id"
                  class="ml-auto w-4 h-4 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button
          @click="enviarRespuesta"
          :disabled="!selected"
          class="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar respuesta
        </button>
      </template>
    </div>

    <!-- Resultado -->
    <div v-else class="flex flex-col items-center gap-4 text-center">
      <img
        v-if="pokemon?.sprite"
        :src="pokemon.sprite"
        :class="['w-32 h-32 cursor-pointer', { bounce: bouncing }]"
        @click="triggerBounce"
        @touchstart.prevent="triggerBounce"
        @animationend="bouncing = false"
      />
      <p class="text-lg font-bold">{{ pokemon?.displayName }}</p>
      <template v-if="winner">
        <p class="text-4xl">🏆</p>
        <h2 class="text-2xl font-bold">{{ winner.name }} ganó!</h2>
      </template>
      <template v-else>
        <p class="text-4xl">😵</p>
        <h2 class="text-2xl font-bold">¡Nadie adivinó!</h2>
      </template>
      <button
        @click="volverAlInicio"
        class="w-48 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  </div>
</template>
