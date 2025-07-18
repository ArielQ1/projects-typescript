import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '../types.d'
import { useState } from 'react'

export function EditUser () {
  const location = useLocation()
  const user = location.state?.user as User
  const [updatedUser, setUpdatedUser] = useState<User>(user)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      alert('User updated successfully')
      navigate('/')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  return (
    <div className='bg-blue-950/80 p-4 min-h-screen grid place-content-center'>
      <h1 className='text-center text-3xl font-bold text-white'>Edit User</h1>
      <div className='max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg'>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-white mb-2' htmlFor='name'>Name:</label>
            <input
              type='text'
              id='name'
              value={updatedUser.name}
              onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
              className='w-full p-2 bg-gray-700 text-white rounded'
            />
          </div>
          <div className='mb-4'>
            <label className='block text-white mb-2' htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              value={updatedUser.email}
              onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
              className='w-full p-2 bg-gray-700 text-white rounded'
            />
          </div>
          <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Update User</button>
          <button type='button' onClick={() => navigate('/')} className='ml-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'>Back</button>
        </form>
      </div>
    </div>
  )
}
