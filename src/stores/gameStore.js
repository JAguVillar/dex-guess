import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  const status = ref('waiting')
  const players = ref([])
  const winner = ref(null) // { id, name }
  const pokemon = ref(null)
  const answers = ref({}) // { playerId: pokemonId }

  const state = reactive({
    get status() {
      return status.value
    },
    get players() {
      return players.value
    },
    get winner() {
      return winner.value
    },
    get pokemon() {
      return pokemon.value
    },
    get answers() {
      return answers.value
    },
  })

  function addPlayer(player) {
    if (!players.value.find((p) => p.id === player.id)) {
      players.value.push(player)
    }
    console.log(players.value)
  }

  function removePlayer(id) {
    players.value = players.value.filter((p) => p.id !== id)
  }

  function setState(newState) {
    players.value = newState.players
    status.value = newState.status
    winner.value = newState.winner
    pokemon.value = newState.pokemon ?? null
    answers.value = newState.answers ?? []
  }

  function setPokemon(newPokemon) {
    pokemon.value = newPokemon
  }
  function startGame() {
    status.value = 'playing'
    winner.value = null
  }

  function applyAction(payload, fromId) {
    if (status.value !== 'playing') return
    if (answers.value[fromId]) return // ya respondió

    if (payload.type === 'GUESS_POKEMON') {
      answers.value[fromId] = payload.pokemonId

      // Si todos respondieron, resolver
      if (Object.keys(answers.value).length >= players.value.length) {
        resolveRound()
      }
    }
  }

  function resolveRound() {
    const correctId = pokemon.value?.id
    const winnerEntry = players.value.find((p) => answers.value[p.id] === correctId)

    winner.value = winnerEntry ? { id: winnerEntry.id, name: winnerEntry.name } : null
    status.value = 'finished'
  }

  function $reset() {
    status.value = 'waiting'
    players.value = []
    winner.value = null
    answers.value = []
  }

  return {
    status,
    players,
    winner,
    state,
    pokemon,
    addPlayer,
    removePlayer,
    setState,
    setPokemon,
    startGame,
    applyAction,
    $reset,
    answers,
  }
})
