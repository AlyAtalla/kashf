import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import auth from './lib/auth'

export default function App() {
  const [user, setUser] = useState<any | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = auth.getToken()
    if (token) {
      const payload = auth.decodeToken(token)
      setUser(payload || null)
    }
  }, [])

  function handleLogout() {
    auth.clearToken()
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-semibold text-lg">
              Kashf
            </Link>
            <Link to="/search" className="text-sm text-gray-600">
              Find Professionals
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-700">{user.role || 'user'}</span>
                <button onClick={handleLogout} className="text-sm text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm text-gray-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
