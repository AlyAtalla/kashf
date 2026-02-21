import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const created = await api.post('/api/auth/register', { email, password, role })
      if (created?.id) {
        // auto-login after register
        const login = await api.post('/api/auth/login', { email, password })
        if (login?.token) {
          loginWithToken(login.token)
          navigate('/')
        } else {
          navigate('/login')
        }
      } else {
        setError('Registration failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-gray-600 text-sm mb-6">Join our platform to find the right professional</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="PATIENT">👤 Patient - Looking for a professional</option>
              <option value="PROFESSIONAL">👨‍⚕️ Professional - Mental health expert</option>
            </select>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 hover:shadow-lg transition mt-6" disabled={loading} type="submit">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</a></p>
      </div>
    </div>
  )
}

