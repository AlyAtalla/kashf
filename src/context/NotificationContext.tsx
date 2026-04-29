import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSocket } from '../lib/socket'
import { useAuth } from './AuthContext'

type Notification = {
  id: string
  message: string
  type: 'message' | 'info'
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (message: string, type?: 'message' | 'info') => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  const addNotification = useCallback((message: string, type: 'message' | 'info' = 'info') => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  useEffect(() => {
    if (!user) return

    const socket = getSocket()
    
    const handleNewMessage = (data: { fromId: string; content: string }) => {
      addNotification(`New message: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`, 'message')
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [user, addNotification])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}