import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

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
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', specialization: '', location: '' })

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
      if (res) {
        setForm({
          name: res.name || '',
          bio: res.bio || '',
          specialization: res.specialization || '',
          location: res.location || ''
        })
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  function isOwner() {
    try {
      return Boolean(user && profile && (user.sub === profile.user?.id || user.sub === profile.user?.id))
    } catch {
      return false
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      await api.post('/api/profiles', { userId: user.sub, ...form })
      if (profile?.id) fetchProfile(profile.id)
      setEditing(false)
    } catch (err: any) {
      setError(err?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Profile</h2>
      {loading && <div className="mt-2">Loading...</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}

      {profile ? (
        <div className="mt-4 bg-white p-4 border rounded">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{profile.name || profile.user?.email}</div>
              <div className="text-sm text-gray-600">{profile.specialization}</div>
              <div className="mt-2">{profile.bio}</div>
              <div className="mt-2 text-sm text-gray-500">{profile.location}</div>
            </div>
            {isOwner() && (
              <div>
                <button onClick={() => setEditing((s) => !s)} className="text-sm text-blue-600">
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            )}
          </div>

          {editing && (
            <form onSubmit={handleSave} className="mt-4 flex flex-col gap-2">
              <input className="border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
              <input className="border p-2 rounded" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization" />
              <input className="border p-2 rounded" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
              <textarea className="border p-2 rounded" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" />
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded" disabled={loading}>
                  Save
                </button>
                <button type="button" onClick={() => setEditing(false)} className="py-2 px-4 rounded border">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-4 bg-white p-4 border rounded">
          <div className="text-sm text-gray-700">Profile not found.</div>
          {user && user.sub === id && (
            <div className="mt-3">
              <div className="text-sm text-gray-600">You don't have a profile yet. Create one:</div>
              <form onSubmit={handleSave} className="mt-3 flex flex-col gap-2">
                <input className="border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
                <input className="border p-2 rounded" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization" />
                <input className="border p-2 rounded" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
                <textarea className="border p-2 rounded" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded" disabled={loading}>
                    Create profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
