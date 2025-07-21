import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Book } from '../types.d'

export function EditBook () {
  const location = useLocation()
  const navigate = useNavigate()
  const edit = location.state?.book as Book | undefined

  const [book, setBook] = useState<Book | null>(edit ?? null)

  const editBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!book) return
    const editBookRequest = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/books/${book.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(book)
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        navigate('/books')
      } catch (error) {
        console.error('Failed to edit book:', error)
      }
    }
    editBookRequest()
  }

  if (!book) return null

  return (
    <div className='bg-neutral-900 max-w-screen min-h-screen p-4'>
      <h1 className='text-white font-bold text-4xl'>Edit book</h1>
      <form onSubmit={editBook} className='bg-neutral-800 rounded-lg mt-5 p-4'>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='title'>Title</label>
          <input
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value } as Book)}
            type='text'
            id='title'
            className='w-full p-2 bg-neutral-700 text-white rounded'
            placeholder='Enter book title'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='author'>Author</label>
          <input
            value={book.author}
            onChange={(e) => setBook({ ...book, author: e.target.value } as Book)}
            type='text'
            id='author'
            className='w-full p-2 bg-neutral-700 text-white rounded'
            placeholder='Enter author name'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='edition'>Edition</label>
          <input
            value={book.edition}
            onChange={(e) => setBook({ ...book, edition: e.target.value } as Book)}
            type='text'
            id='edition'
            className='w-full p-2 bg-neutral-700 text-white rounded'
            placeholder='Enter book edition'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white mb-2' htmlFor='availability'>Availability</label>
          <select
            value={book.availability ? 'true' : 'false'}
            onChange={(e) => setBook({ ...book, availability: e.target.value === 'true' } as Book)}
            id='availability'
            className='w-full p-2 bg-neutral-700 text-white rounded'
          >
            <option value='true'>Available</option>
            <option value='false'>Not Available</option>
          </select>
        </div>
        <button type='submit' className='bg-green-500 px-4 py-2 hover:bg-green-600 transition-colors duration-300 text-white rounded font-bold'>Save Changes</button>
      </form>
    </div>
  )
}
