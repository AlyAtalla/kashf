import React from 'react'
import { useParams } from 'react-router-dom'

export default function Profile() {
  const { id } = useParams()
  return (
    <div>
      <h2 className="text-xl font-semibold">Profile</h2>
      <p className="mt-2 text-gray-600">Professional ID: {id}</p>
    </div>
  )
}
