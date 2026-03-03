import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  const status = ref('waiting') // waiting | playing | round_result | finished
  const players = ref([]) // [{ id, name, score }]
  const pokemon = ref(null)
  const answers = ref({})
  const round = ref(0)
  const totalRounds = ref(5)
  const roundResult = ref(null) // { correctPlayers: [], pokemon }
  const pokemons = ref([])

  const state = reactive({
    get status() {
      return status.value
    },
    get players() {
      return players.value
    },
    get pokemon() {
      return pokemon.value
    },
    get answers() {
      return answers.value
    },
    get round() {
      return round.value
    },
    get totalRounds() {
      return totalRounds.value
    },
    get roundResult() {
      return roundResult.value
    },
    get pokemons() {
      return pokemons.value
    },
  })

  function addPlayer(player) {
    if (!players.value.find((p) => p.id === player.id)) {
      players.value.push({ ...player, score: 0 })
    }
  }

  function removePlayer(id) {
    players.value = players.value.filter((p) => p.id !== id)
  }

  function setState(newState) {
    status.value = newState.status
    players.value = newState.players
    pokemon.value = newState.pokemon ?? null
    answers.value = newState.answers ?? {}
    round.value = newState.round ?? 0
    totalRounds.value = newState.totalRounds ?? 5
    roundResult.value = newState.roundResult ?? null
    pokemons.value = newState.pokemons ?? []
  }

  function setTotalRounds(n) {
    totalRounds.value = n
  }

  function setPokemon(data) {
    pokemon.value = data
  }

  function startGame() {
    players.value = players.value.map((p) => ({ ...p, score: 0 }))
    round.value = 0
    pokemons.value = []
    status.value = 'playing'
    roundResult.value = null
  }

  function setPokemons(pokemon) {
    pokemons.value.push(pokemon)
    console.log(pokemons.value)
  }

  function startRound(newPokemon) {
    round.value++
    pokemon.value = newPokemon
    pokemons.value.push(newPokemon)
    answers.value = {}
    roundResult.value = null
    status.value = 'playing'
  }

  function applyAction(payload, fromId) {
    if (status.value !== 'playing') return
    if (answers.value[fromId]) return

    if (payload.type === 'GUESS_POKEMON') {
      answers.value[fromId] = payload.pokemonId

      if (Object.keys(answers.value).length >= players.value.length) {
        resolveRound()
      }
    }
  }

  function resolveRound() {
    const correctId = pokemon.value?.id
    const correctPlayers = []

    players.value.forEach((p) => {
      if (answers.value[p.id] === correctId) {
        p.score++
        correctPlayers.push(p.name)
      }
    })

    roundResult.value = {
      correctPlayers,
      pokemon: { ...pokemon.value },
    }

    if (round.value >= totalRounds.value) {
      status.value = 'finished'
    } else {
      status.value = 'round_result'
    }
  }

  function getWinners() {
    const maxScore = Math.max(...players.value.map((p) => p.score))
    return players.value.filter((p) => p.score === maxScore)
  }

  function $reset() {
    status.value = 'waiting'
    players.value = []
    pokemon.value = null
    answers.value = {}
    round.value = 0
    totalRounds.value = 5
    roundResult.value = null
    pokemons.value = []
  }

  return {
    status,
    players,
    pokemon,
    answers,
    round,
    totalRounds,
    roundResult,
    pokemons,
    state,
    addPlayer,
    removePlayer,
    setState,
    setTotalRounds,
    setPokemon,
    setPokemons,
    startGame,
    startRound,
    applyAction,
    getWinners,
    $reset,
  }
})
