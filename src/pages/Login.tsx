import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import auth from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', { email, password })
      if (data?.token) {
        auth.setToken(data.token)
        navigate('/')
      } else {
        setError('Invalid response from server')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold">Sign in</h2>
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
        {error && <div className="text-red-600">{error}</div>}
        <button
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
