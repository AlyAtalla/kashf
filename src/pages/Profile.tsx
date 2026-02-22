import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

type ProfileData = {
  id: string
  name?: string
  bio?: string
  specialization?: string
  location?: string
  avatarUrl?: string
  pricePerSession?: number
  user?: { id: string; email: string }
}

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', specialization: '', location: '', pricePerSession: '' })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)


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
          location: res.location || '',
          pricePerSession: res.pricePerSession || ''
        })
        if (res.avatarUrl) setAvatarPreview(res.avatarUrl)
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

  const navigate = useNavigate()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const pricePerSession = form.pricePerSession ? parseFloat(form.pricePerSession) : undefined
      const created = await api.post('/api/profiles', { userId: user.sub, ...form, pricePerSession, avatarUrl: avatarPreview })
      // Try to refresh profile: prefer returned id, otherwise fetch by user id
      if (created?.id) {
        await fetchProfile(created.id)
      } else {
        await fetchProfile(user.sub)
      }
      setEditing(false)
    } catch (err: any) {
      setError(err?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile) return
    try {
      const favs = JSON.parse(localStorage.getItem('kashf:favourites') || '[]') as string[]
      setIsFavorited(Boolean(profile.user && favs.includes(profile.user.id)))
    } catch {
      setIsFavorited(false)
    }
  }, [profile])

  function toggleFavourite() {
    if (!profile?.user?.id) return
    try {
      const key = 'kashf:favourites'
      const favs = JSON.parse(localStorage.getItem(key) || '[]') as string[]
      if (favs.includes(profile.user.id)) {
        const next = favs.filter((id) => id !== profile.user.id)
        localStorage.setItem(key, JSON.stringify(next))
        setIsFavorited(false)
      } else {
        favs.push(profile.user.id)
        localStorage.setItem(key, JSON.stringify(favs))
        setIsFavorited(true)
      }
    } catch {
      // ignore
    }
  }

  async function openMessageModal() {
    if (!user) return navigate('/login')
    if (!profile?.user?.id) return
    setShowMessageModal(true)
    try {
      const res = await api.get(`/api/messages/conversation/${user.sub}/${profile.user.id}`)
      setMessages(res || [])
    } catch (err: any) {
      // ignore for now
    }
  }

  async function sendMessage() {
    if (!user || !profile?.user?.id) return
    if (!newMessage.trim()) return
    try {
      const created = await api.post('/api/messages', { fromId: user.sub, toId: profile.user.id, content: newMessage })
      setMessages((m) => [...m, created])
      setNewMessage('')
    } catch (err: any) {
      // ignore
    }
  }

  function openBooking() {
    if (!user) return navigate('/login')
    if (!profile?.user) return
    // Client-side quick check for dummy/test accounts (seed uses @kashf.com)
    if ((profile.user.email || '').endsWith('@kashf.com')) {
      setBookingError('This is a dummy/test account and cannot accept bookings.')
      setShowBookingModal(true)
      return
    }
    setBookingError(null)
    setShowBookingModal(true)
  }

  async function submitBooking() {
    if (!user || !profile?.user?.id || !scheduledAt) return
    try {
      const res = await api.post('/api/appointments', { patientId: user.sub, professionalId: profile.user.id, scheduledAt })
      // success: close modal
      setShowBookingModal(false)
      setScheduledAt('')
      alert('Appointment scheduled')
    } catch (err: any) {
      if (err?.message) setBookingError(err.message)
      else setBookingError('Failed to schedule')
    }
  }

  return (
    <div>
      {loading && <div className="text-center py-12 text-gray-500">Loading profile...</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-6">{error}</div>}

      {profile ? (
        <div className="max-w-3xl">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-8 mb-8">
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name || profile.user?.email}</h1>
                  <p className="text-lg text-blue-600 font-medium mb-2">{profile.specialization || 'Mental Health Professional'}</p>
                  <div className="text-gray-600 flex items-center gap-2 mb-4">
                    📍 {profile.location || 'Location not specified'}
                  </div>
                  {profile.bio && <p className="text-gray-700 leading-relaxed">{profile.bio}</p>}
                  {profile.pricePerSession && !isOwner() && (
                    <div className="mt-4 inline-block bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-lg px-4 py-2">
                      <p className="text-sm font-semibold text-green-800">💰 ${profile.pricePerSession}/session</p>
                    </div>
                  )}
                  <div className="mt-6 flex gap-3 items-center">
                    {isOwner() ? (
                      <button onClick={() => setEditing((s) => !s)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                        {editing ? '✓ Cancel' : '🔧 Edit Profile'}
                      </button>
                    ) : (
                      <>
                        <button onClick={openMessageModal} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                          💬 Message
                        </button>
                        <button onClick={openBooking} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                          📅 Book Session
                        </button>
                        <button onClick={toggleFavourite} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                          {isFavorited ? '♥ Favourited' : '♡ Add to favourites'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Message Modal */}
                  {showMessageModal && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white max-w-xl w-full rounded-lg shadow-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold">Conversation with {profile.name || profile.user?.email}</h3>
                          <button onClick={() => setShowMessageModal(false)} className="text-gray-500">Close</button>
                        </div>
                        <div className="h-64 overflow-auto p-2 border rounded mb-3">
                          {messages.map((m) => (
                            <div key={m.id} className={`mb-2 ${m.fromId === user?.sub ? 'text-right' : 'text-left'}`}>
                              <div className={`inline-block px-3 py-2 rounded ${m.fromId === user?.sub ? 'bg-green-100' : 'bg-gray-100'}`}>{m.content}</div>
                              <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message" className="flex-1 px-3 py-2 border rounded" />
                          <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Modal */}
                  {showBookingModal && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white max-w-md w-full rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold">Book Session with {profile.name || profile.user?.email}</h3>
                          <button onClick={() => { setShowBookingModal(false); setBookingError(null); setScheduledAt('') }} className="text-gray-500">Close</button>
                        </div>
                        {bookingError ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded mb-4">{bookingError}</div>
                        ) : (
                          <div className="space-y-3">
                            <label className="block text-sm text-gray-700">Choose date & time</label>
                            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full px-3 py-2 border rounded" />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setShowBookingModal(false); setScheduledAt('') }} className="px-4 py-2 border rounded">Cancel</button>
                              <button onClick={submitBooking} className="px-4 py-2 bg-green-600 text-white rounded">Confirm</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Your Profile</h2>
                  <div className="mb-6 flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-green-400" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Change Profile Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0]
                          if (!file) return
                          if (file.size > 2 * 1024 * 1024) {
                            setError('Image must be under 2MB')
                            return
                          }
                          const reader = new FileReader()
                          reader.onload = () => {
                            setError(null)
                            setAvatarPreview(String(reader.result))
                          }
                          reader.readAsDataURL(file)
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g., Clinical Psychology, Psychiatry" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself, your experience, and approach..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Session ($)</label>
                      <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" type="number" step="0.01" min="0" value={form.pricePerSession} onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })} placeholder="e.g., 75.00" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50" disabled={loading}>
                        {loading ? 'Saving...' : '💾 Save Changes'}
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl">
          <div className="text-gray-700 mb-4">Profile not found.</div>
          {user && user.sub === id && (
            <div>
              <div className="text-gray-600 mb-6">You don't have a profile yet. Create one to get started:</div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Your specialization" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Session ($)</label>
                  <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" type="number" step="0.01" min="0" value={form.pricePerSession} onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })} placeholder="e.g., 75.00" />
                </div>
                <button type="submit" className="w-full px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50" disabled={loading}>
                  {loading ? 'Creating...' : '✅ Create Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
