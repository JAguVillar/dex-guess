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
  <div class="flex flex-col items-center justify-center h-full gap-6">
    <!-- Jugando -->
    <div v-if="!finished" class="flex flex-col items-center gap-4 w-80">
      <h2 class="text-xl font-bold text-center">¿Quién es ese Pokémon?</h2>

      <p class="text-sm text-muted-foreground">
        Jugadores: {{ gameStore.players.map((p) => p.name).join(', ') }}
      </p>

      <p class="text-sm text-center italic">{{ pokemon?.dexEntry }}</p>

      <!-- Ya respondió, esperando al resto -->
      <div v-if="alreadyAnswered" class="text-center">
        <p class="font-bold">¡Respuesta enviada!</p>
        <p class="text-sm text-muted-foreground">
          Esperando al resto ({{ answeredCount }}/{{ gameStore.players.length }})...
        </p>
      </div>

      <!-- Todavía puede responder -->
      <template v-else>
        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="open"
              class="w-full justify-between"
            >
              {{ selected ? selected.displayName : 'Elegí un Pokémon...' }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-80 p-0">
            <Command>
              <CommandInput v-model="search" placeholder="Buscar pokémon..." />
              <CommandEmpty>No se encontró ningún Pokémon.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="p in filtered"
                    :key="p.id"
                    :value="p.name"
                    @select="onSelect(p)"
                  >
                    {{ p.displayName }}
                    <Check v-if="selected?.id === p.id" class="ml-auto h-4 w-4" />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button @click="enviarRespuesta" :disabled="!selected" class="w-full">
          Enviar respuesta
        </Button>
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
      <Button @click="volverAlInicio" class="w-48 mt-4">Volver al inicio</Button>
    </div>
  </div>
</template>
