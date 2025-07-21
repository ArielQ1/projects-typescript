import { Route, Routes } from 'react-router-dom'
import { ListBooks } from './pages/ListBooks'
import { CreateBook } from './pages/CreateBook'
import { EditBook } from './pages/EditBook'

function App () {
  return (
    <Routes>
      <Route path='/' element={<ListBooks />} />
      <Route path='/books'>
        <Route index element={<ListBooks />} />
        <Route path='create' element={<CreateBook />} />
        <Route path='edit' element={<EditBook />} />
      </Route>
    </Routes>
  )
}

export default App
