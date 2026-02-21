import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'

type UserWithProfile = {
  id: string
  email: string
  role: string
  profile?: { id: string; name?: string; specialization?: string; location?: string }
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UserWithProfile[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecent()
  }, [])

  async function fetchRecent() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/profiles?role=PROFESSIONAL&limit=6')
      setResults(res?.results || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to Kashf</h1>
      <p className="mt-2 text-gray-600">Platform connecting psychiatric professionals and patients.</p>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Featured Professionals</h2>
        <Link to="/search" className="text-sm text-blue-600">See all</Link>
      </div>

      {loading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((u) => (
          <div key={u.id} className="p-4 bg-white border rounded flex gap-4 items-center">
            {u.profile?.avatarUrl ? (
              <img src={u.profile.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">No Image</div>
            )}
            <div className="flex-1">
              <div className="font-semibold">{u.profile?.name || u.email}</div>
              <div className="text-sm text-gray-600">{u.profile?.specialization}</div>
              <div className="text-sm text-gray-500">{u.profile?.location}</div>
            </div>
            <div>
              <Link to={`/profile/${u.profile?.id || u.id}`} className="text-sm text-blue-600">View profile</Link>
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && <div className="text-sm text-gray-600">No professionals found yet.</div>}
      </div>
    </div>
  )
}
