import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false
    })
  }
  return socket
}

export function connectSocket(userId: string): void {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
    s.emit('join', userId)
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
  }
}

export default socket