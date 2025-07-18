import { Route, Routes } from 'react-router-dom'
import { UsersList } from './pages/UsersList'
import { Register } from './pages/Register'
import { EditUser } from './pages/EditUser'

function App () {
  return (
    <Routes>
      <Route path='/' element={<UsersList />} />
      <Route path='/register' element={<Register />} />
      <Route path='/edit' element={<EditUser />} />
    </Routes>
  )
}

export default App
