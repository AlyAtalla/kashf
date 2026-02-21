import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'

type UserWithProfile = {
  id: string
  email: string
  role: string
  profile?: { id: string; name?: string; specialization?: string; location?: string }
}

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchResults() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/profiles?q=${encodeURIComponent(q)}&role=PROFESSIONAL`)
      setResults(res?.results || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Search professionals</h2>
      <div className="mt-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border p-2 rounded flex-1"
          placeholder="Search by name, bio, email..."
        />
        <button onClick={fetchResults} className="bg-blue-600 text-white px-3 rounded">
          Search
        </button>
      </div>

      {loading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}

      <ul className="mt-4 space-y-3">
        {results.map((u) => (
          <li key={u.id} className="p-3 bg-white border rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.profile?.name || u.email}</div>
                <div className="text-sm text-gray-600">{u.profile?.specialization}</div>
                <div className="text-sm text-gray-500">{u.profile?.location}</div>
              </div>
              <Link to={`/profile/${u.profile?.id || u.id}`} className="text-sm text-blue-600">
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
