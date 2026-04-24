import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Messages() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
        <p className="text-gray-600">You need to be signed in to access your messages.</p>
        <div className="mt-6">
          <Link to="/login" className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
      <p className="text-gray-600 mb-6">This is your messaging center. Open a profile to start a conversation.</p>
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
        No active conversations yet.
      </div>
    </div>
  )
}
