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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find a Professional</h2>
        <p className="text-gray-600">Search by name, specialization, or expertise to find the right mental health professional for you.</p>
      </div>
      
      <div className="mb-8 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchResults()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Search by name, specialization, location..."
        />
        <button onClick={fetchResults} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition">
          Search
        </button>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Searching professionals...</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((u) => (
          <div key={u.id} className="p-5 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-lg">{u.profile?.name || u.email}</div>
                <div className="text-blue-600 font-medium text-sm">{u.profile?.specialization || 'Mental Health Professional'}</div>
                <div className="text-sm text-gray-500 mt-1">📍 {u.profile?.location || 'Location not specified'}</div>
              </div>
              <Link to={`/profile/${u.profile?.id || u.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition whitespace-nowrap">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
      {results.length === 0 && !loading && q && <div className="text-center py-8 text-gray-500">No professionals found matching your search.</div>}
      {results.length === 0 && !loading && !q && <div className="text-center py-8 text-gray-500">Try searching to find professionals.</div>}
    </div>
  )
}
