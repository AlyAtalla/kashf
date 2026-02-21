import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Me() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // user.sub contains the user id (from JWT payload)
    navigate(`/profile/${user.sub}`)
  }, [user, navigate])

  return <div>Redirecting to your profile...</div>
}
