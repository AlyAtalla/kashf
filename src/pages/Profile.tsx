import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'

type ProfileData = {
  id: string
  name?: string
  bio?: string
  specialization?: string
  location?: string
  user?: { id: string; email: string }
}

export default function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchProfile(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchProfile(pid: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/profiles/${pid}`)
      setProfile(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Profile</h2>
      {loading && <div className="mt-2">Loading...</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {profile && (
        <div className="mt-4 bg-white p-4 border rounded">
          <div className="text-lg font-semibold">{profile.name || profile.user?.email}</div>
          <div className="text-sm text-gray-600">{profile.specialization}</div>
          <div className="mt-2">{profile.bio}</div>
          <div className="mt-2 text-sm text-gray-500">{profile.location}</div>
        </div>
      )}
    </div>
  )
}
