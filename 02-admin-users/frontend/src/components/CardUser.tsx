import type { User } from '../types.d'

interface Props {
  user: User
  roles?: { id: string; name: string }[]
  deteteUser?: (userId: string) => void
  editUser?: (user: User) => void
}

export function CardUser ({ user, roles, deteteUser, editUser }: Props) {
  const roleName = roles?.find(role => role.id === user.role_id)?.name || 'Unknown Role'

  const handleDelete = () => {
    if (deteteUser && user.id !== undefined) {
      deteteUser(user.id)
    }
  }

  const handleEdit = () => {
    if (editUser) {
      editUser(user)
    }
  }

  return (
    <div className='border border-amber-50/50 w-80 bg-gradient-to-tl from-gray-900 via-blue-800 to-gray-900 p-4 rounded-lg'>
      <h1 className='text-xs font-bold text-white/40 mb-2'>User ID: {user.id}</h1>
      <h3 className='text-base text-white'><strong className='text-red-200'>Name : </strong>{user.name}</h3>
      <p className='text-sm text-gray-300'><strong className='text-red-200'>Email : </strong>{user.email}</p>
      <p className='text-sm text-gray-300'><strong className='text-red-200'>Role : </strong>{roleName}</p>
      <div className='w-full flex justify-center gap-5'>
        <button onClick={handleEdit} className='mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Edit</button>
        <button onClick={handleDelete} className='mt-2 ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'>Delete</button>
      </div>
    </div>
  )
}
