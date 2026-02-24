import { ref } from 'vue'
import Peer from 'peerjs'

export function usePeer() {
  const peer = ref(null) // instancia principal de PeerJS
  const myId = ref(null) // ID que nos asigna (o elegimos) en la red P2P
  const ready = ref(false) // true cuando la conexión con el servidor de signaling está lista

  /**
   * Inicializa el peer.
   * @param {string|undefined} customId - Si se pasa, ese será nuestro ID público (útil para el host).
   *                                      Si no, PeerJS genera uno aleatorio.
   */
  function initPeer(customId = undefined) {
    peer.value = new Peer(customId)

    // El servidor de signaling nos confirmó el ID y estamos listos para conectar
    peer.value.on('open', (id) => {
      myId.value = id
      ready.value = true
    })

    // Errores de red o ID duplicado
    peer.value.on('error', (err) => {
      console.error('[PeerJS error]', err.type, err)
    })

    return peer.value
  }

  /**
   * Destruye la conexión limpiamente (útil al salir de la sala o desmontar el componente).
   */
  function destroyPeer() {
    peer.value?.destroy()
    peer.value = null
    myId.value = null
    ready.value = false
  }

  return { peer, myId, ready, initPeer, destroyPeer }
}
