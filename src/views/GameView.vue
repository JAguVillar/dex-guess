<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peerStore'
import { useGameStore } from '@/stores/gameStore'
import { useHost } from '@/composables/useHost'
import { useClient } from '@/composables/useClient'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

function onSelect(p) {
  selected.value = p
  open.value = false
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
  <div class="flex flex-col items-center justify-center h-full gap-6 px-4 py-8">
    <!-- === PLAYING PHASE === -->
    <div v-if="!finished" class="w-full max-w-sm space-y-5">
      <!-- Header -->
      <div class="text-center space-y-1">
        <h2 class="text-2xl font-black text-white">¿Quién es ese Pokémon?</h2>
        <p class="text-xs text-white/35">
          {{ gameStore.players.map((p) => p.name).join(' · ') }}
        </p>
      </div>

      <!-- Pokedex entry card -->
      <div
        class="glass-card rounded-2xl p-5 space-y-3"
        style="border-left: 2px solid rgb(239 68 68 / 0.45)"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style="background: rgb(239 68 68 / 0.18)"
          >
            <svg
              class="w-3.5 h-3.5"
              style="color: #f87171"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span class="text-xs text-white/30 font-semibold uppercase tracking-wider"
            >Entrada Pokédex</span
          >
        </div>
        <p class="text-sm text-white/75 leading-relaxed italic">{{ pokemon?.dexEntry }}</p>
      </div>

      <!-- Already answered -->
      <div v-if="alreadyAnswered" class="glass-card rounded-2xl p-5 text-center space-y-3">
        <div
          class="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
          style="background: rgb(34 197 94 / 0.15)"
        >
          <svg
            class="w-6 h-6"
            style="color: #4ade80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div class="space-y-0.5">
          <p class="font-bold text-white text-sm">¡Respuesta enviada!</p>
          <p class="text-xs text-white/35">
            Esperando al resto
            <span class="font-mono font-bold text-white/55"
              >{{ answeredCount }}/{{ gameStore.players.length }}</span
            >
          </p>
        </div>
        <!-- Progress bar -->
        <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgb(255 255 255 / 0.08)">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="background: linear-gradient(90deg, #ef4444, #facc15)"
            :style="`width: ${(answeredCount / gameStore.players.length) * 100}%`"
          ></div>
        </div>
      </div>

      <!-- Can still answer -->
      <template v-else>
        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="open"
              class="w-full h-11 justify-between text-white"
              style="background: rgb(255 255 255 / 0.04); border-color: rgb(255 255 255 / 0.1)"
            >
              <span :class="selected ? 'text-white' : 'text-white/30'">
                {{ selected ? selected.displayName : 'Elegí un Pokémon...' }}
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 text-white/30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            class="w-80 p-0"
            style="background: oklch(0.11 0.02 265); border-color: rgb(255 255 255 / 0.1)"
          >
            <Command>
              <CommandInput v-model="search" placeholder="Buscar Pokémon..." />
              <CommandEmpty class="py-6 text-center text-sm text-white/35"
                >No se encontró ningún Pokémon.</CommandEmpty
              >
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="p in filtered"
                    :key="p.id"
                    :value="p.name"
                    @select="onSelect(p)"
                    class="cursor-pointer"
                  >
                    {{ p.displayName }}
                    <Check v-if="selected?.id === p.id" class="ml-auto h-4 w-4" />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button @click="enviarRespuesta" :disabled="!selected" class="w-full" size="lg">
          Enviar respuesta
        </Button>
      </template>
    </div>

    <!-- === RESULTS PHASE === -->
    <div v-else class="w-full max-w-xs space-y-4 text-center">
      <!-- Pokemon reveal card -->
      <div class="glass-card rounded-2xl p-6 space-y-4">
        <!-- Sprite with glow -->
        <div class="relative flex justify-center">
          <div
            class="absolute inset-0 rounded-full blur-3xl"
            style="
              background: radial-gradient(
                circle,
                oklch(0.62 0.26 20 / 0.25) 0%,
                transparent 70%
              );
            "
          ></div>
          <img
            v-if="pokemon?.sprite"
            :src="pokemon.sprite"
            :class="['relative cursor-pointer select-none', { bounce: bouncing }]"
            style="
              width: 128px;
              height: 128px;
              image-rendering: pixelated;
              filter: drop-shadow(0 0 16px oklch(0.62 0.26 20 / 0.45));
            "
            @click="triggerBounce"
            @touchstart.prevent="triggerBounce"
            @animationend="bouncing = false"
            alt="Pokemon sprite"
          />
        </div>

        <div class="space-y-0.5">
          <p class="text-xs text-white/30 uppercase tracking-wider font-semibold">Era...</p>
          <p class="text-2xl font-black text-white">{{ pokemon?.displayName }}</p>
        </div>
      </div>

      <!-- Winner / No winner -->
      <div
        class="glass-card rounded-2xl p-5 space-y-2"
        :style="
          winner
            ? 'border-color: rgb(250 204 21 / 0.3); box-shadow: 0 4px 24px rgb(250 204 21 / 0.08)'
            : ''
        "
      >
        <template v-if="winner">
          <div class="text-4xl mb-1">🏆</div>
          <p class="text-xs text-yellow-400/70 uppercase tracking-wider font-semibold">
            ¡Ganador!
          </p>
          <h2 class="text-xl font-black text-white">{{ winner.name }}</h2>
          <p class="text-xs text-white/30">adivinó el Pokémon</p>
        </template>
        <template v-else>
          <div class="text-4xl mb-1">😵</div>
          <h2 class="text-xl font-black text-white">¡Nadie adivinó!</h2>
          <p class="text-xs text-white/35">Mejor suerte la próxima vez</p>
        </template>
      </div>

      <Button @click="volverAlInicio" class="w-full" size="lg"> Volver al inicio </Button>
    </div>
  </div>
</template>
