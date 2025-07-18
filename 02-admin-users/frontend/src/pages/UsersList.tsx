import { useEffect, useState } from 'react'
import { CardUser } from '../components/CardUser'
import type { Role, User } from '../types.d'
import { useNavigate } from 'react-router-dom'

export function UsersList () {
  const [users, setUsers] = useState<User[]>([])
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
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  const handleCreate = () => {
    navigate('/register')
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      alert('User deleted successfully')
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const editUser = (user: User) => {
    navigate('/edit', { state: { user } })
  }

  return (
    <div className='bg-blue-950/80 p-4 min-h-screen'>
      <h1 className='text-center text-3xl font-bold text-white'>Users List</h1>
      <div className='flex justify-center'>
        <button onClick={handleCreate} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors duration-200 mt-4'>
          Add User
        </button>
      </div>
      <div className='flex flex-wrap justify-center gap-4 mt-6'>
        {users.map(user => (
          <CardUser key={user.id} user={user} roles={roles} deteteUser={deleteUser} editUser={editUser} />
        ))}
      </div>
    </div>
  )
}
