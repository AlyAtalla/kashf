import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'

type UserWithProfile = {
  id: string
  email: string
  role: string
  profile?: { id: string; name?: string; specialization?: string; location?: string; pricePerSession?: number; avatarUrl?: string }
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
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Kashf</h1>
        <p className="text-lg text-gray-600">Connecting you with qualified psychiatric professionals for personalized mental health care.</p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Featured Professionals</h2>
        <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium transition">Browse all →</Link>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading professionals...</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((u) => (
          <div key={u.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {u.profile?.avatarUrl ? (
                  <img src={u.profile.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 flex-shrink-0">—</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{u.profile?.name || u.email}</div>
                  <div className="text-sm text-blue-600 font-medium">{u.profile?.specialization || 'Mental Health Professional'}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4 text-center">
                📍 {u.profile?.location || 'Location TBD'}
              </div>
              {u.profile?.pricePerSession && (
                <div className="mb-4 text-center bg-green-50 border border-green-300 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-green-700">💰 ${u.profile.pricePerSession}/session</p>
                </div>
              )}
              <Link to={`/profile/${u.profile?.id || u.id}`} className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
      {results.length === 0 && !loading && <div className="text-center py-12 text-gray-500">No professionals available yet. Check back soon!</div>}
    </div>
  )
}
