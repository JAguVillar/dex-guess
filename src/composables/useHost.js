import { ref } from 'vue'

export function useHost(peerStore, gameStore) {
  function startHosting() {
    peerStore.peer.on('connection', (conn) => {
      conn.on('open', () => {
        peerStore.connections[conn.peer] = conn
        conn.send({ type: 'SYNC', state: gameStore.state })
      })

      conn.on('data', (msg) => handleMessage(conn, msg))

      conn.on('close', () => {
        delete peerStore.connections[conn.peer]
        gameStore.removePlayer(conn.peer)
        broadcast({ type: 'STATE_UPDATE', state: gameStore.state })
      })
    })
  }

  function handleMessage(conn, msg) {
    switch (msg.type) {
      case 'JOIN':
        gameStore.addPlayer({ id: conn.peer, ...msg.payload })
        broadcast({ type: 'STATE_UPDATE', state: gameStore.state })
        break
      case 'PLAYER_ACTION':
        gameStore.applyAction(msg.payload, conn.peer)
        broadcast({ type: 'STATE_UPDATE', state: gameStore.state })
        break
    }
  }

  function broadcast(msg) {
    Object.values(peerStore.connections).forEach((conn) => conn.send(msg))
  }

  function hostAction(payload) {
    gameStore.applyAction(payload, peerStore.myId)
    broadcast({ type: 'STATE_UPDATE', state: gameStore.state })
  }

  return { startHosting, broadcast, hostAction }
}
