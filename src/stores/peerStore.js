import { ref } from 'vue'
import { defineStore } from 'pinia'
import Peer from 'peerjs'

export const usePeerStore = defineStore('peer', () => {
  const peer = ref(null)
  const myId = ref(null)
  const ready = ref(false)
  const isHost = ref(false)

  // Conexiones activas — viven acá para sobrevivir la navegación
  const connections = ref({}) // host: { [peerId]: DataConnection }
  const clientConn = ref(null) // guest: conexión con el host

  function init() {
    if (peer.value) return

    const id = isHost.value ? generateShortId() : undefined
    peer.value = new Peer(id)

    peer.value.on('open', (id) => {
      myId.value = id
      ready.value = true
    })

    peer.value.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.value = null
        init()
        return
      }
      console.error('[PeerStore]', err.type, err.message)
    })
  }

  function generateShortId() {
    //quiero que sea un numero al azar de 0000 a 9999
    const num = Math.floor(Math.random() * 10000)
    return num.toString().padStart(4, '0')
  }

  function destroy() {
    peer.value?.destroy()
    peer.value = null
    myId.value = null
    ready.value = false
    isHost.value = false
    connections.value = {}
    clientConn.value = null
  }

  return { peer, myId, ready, isHost, connections, clientConn, init, destroy }
})
