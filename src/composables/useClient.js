import { ref } from 'vue'

export function useClient(peerStore, gameStore) {
  const connected = ref(false)

  function joinGame(hostId, playerInfo) {
    // Si ya hay una conexión activa, no crear otra
    if (peerStore.clientConn) return // si ya existe la conexión, no crear otra

    peerStore.clientConn = peerStore.peer.connect(hostId)

    peerStore.clientConn.on('open', () => {
      connected.value = true
      peerStore.clientConn.send({ type: 'JOIN', payload: playerInfo })
    })

    peerStore.clientConn.on('data', (msg) => handleMessage(msg))

    peerStore.clientConn.on('close', () => {
      connected.value = false
    })
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'SYNC':
      case 'STATE_UPDATE':
        gameStore.setState(msg.state)
        break
      case 'GAME_START':
        gameStore.setState(msg.state) // esto pone status = 'playing'
        break
    }
  }
  function sendAction(payload) {
    if (!peerStore.clientConn) return
    peerStore.clientConn.send({ type: 'PLAYER_ACTION', payload })
  }

  return { connected, joinGame, sendAction }
}
