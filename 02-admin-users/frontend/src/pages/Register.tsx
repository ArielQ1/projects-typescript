import { useEffect, useState } from 'react'
import type { Role, User } from '../types.d'
import { useNavigate } from 'react-router-dom'

export function Register () {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    role_id: '',
    password: ''
  })
  const [roles, setRoles] = useState<Role[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/roles')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setRoles(data)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }
    fetchRoles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register user')
      }

      alert('User registered successfully')
      setUser({ name: '', email: '', role_id: '', password: '' })
      navigate('/')
    } catch (error) {
      console.error('Error during registration:', error)
      alert('Error registering user')
    }
  }

  return (
    <div className='bg-blue-950/80 p-4 min-h-screen grid place-content-center'>
      <h1 className='text-center text-3xl font-bold text-white'>Register Page</h1>
      <form onSubmit={handleSubmit} className='mt-4 max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg'>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='name'>Name:</label>
          <input
            type='text'
            id='name'
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className='w-full p-2 bg-gray-700 text-white rounded'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className='w-full p-2 bg-gray-700 text-white rounded'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='role'>Role:</label>
          <select id='role' className='w-full p-2 bg-gray-700 text-white rounded' onChange={(e) => setUser({ ...user, role_id: e.target.value })} value={user.role_id}>
            <option value='' disabled>Select the role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className='w-full p-2 bg-gray-700 text-white rounded'
          />
        </div>
        <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors duration-200'>
          Register
        </button>
      </form>
    </div>
  )
}
