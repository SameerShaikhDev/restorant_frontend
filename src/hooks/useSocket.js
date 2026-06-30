import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import useTableSessionStore from '../store/useTableSessionStore'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const useSocket = () => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, tableId } = useTableSessionStore()

  useEffect(() => {
    if (!token || !tableId) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      socketRef.current.emit('join-table', { token })
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [token, tableId])

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  }
}

export default useSocket