import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import auth from '../lib/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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
          auth.setToken(login.token)
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
    <div className="max-w-md">
      <h2 className="text-xl font-semibold">Create account</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="PATIENT">Patient</option>
          <option value="PROFESSIONAL">Professional</option>
        </select>
        {error && <div className="text-red-600">{error}</div>}
        <button className="bg-green-600 text-white py-2 rounded disabled:opacity-50" disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

