import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Me from './pages/Me'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-6 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-xl text-white hover:text-blue-100 transition">
              Kashf
            </Link>
            <Link to="/search" className="text-sm text-blue-100 hover:text-white transition">
              Find Professionals
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/me" className="text-sm text-blue-100 hover:text-white transition">My profile</Link>
                <span className="text-sm text-blue-100 font-medium">{user.role === 'PROFESSIONAL' ? '👨‍⚕️ Professional' : '👤 Patient'}</span>
                <button onClick={handleLogout} className="text-sm text-blue-100 hover:text-red-300 transition font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-blue-100 hover:text-white transition">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/me" element={<Me />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
