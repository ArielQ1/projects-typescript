import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Book } from '../types.d'

export function ListBooks () {
  const [books, setBooks] = useState<Book[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/books')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setBooks(data)
      } catch (error) {
        console.error('Failed to fetch books:', error)
      }
    }
    fetchBooks()
  }, [])

  const addBook = () => {
    navigate('/books/create')
  }

  const handleEdit = (book: Book) => {
    navigate('/books/edit', { state: { book } })
  }

  const handleDelete = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      setBooks(books.filter(book => String(book.id) !== String(bookId)))
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }

  return (
    <div className='bg-neutral-900 max-w-screen min-h-screen p-4'>
      <div className='flex justify-between'>
        <h1 className=' text-white font-bold text-4xl'>Books available</h1>
        <button onClick={addBook} className='bg-green-500 px-4 hover:bg-green-600 transition-colors duration-300 hover:cursor-pointer text-white rounded font-bold'>Add Book</button>
      </div>
      <div className='bg-neutral-800 rounded-lg mt-5'>
        <div className='p-2 bg-neutral-700 flex justify-around rounded-t-lg'>
          <h3 className='w-1/5 text-center text-neutral-300 text-base font-bold'>Title</h3>
          <h3 className='w-1/5 text-center text-neutral-300 text-base font-bold'>Author</h3>
          <h3 className='w-1/5 text-center text-neutral-300 text-base font-bold'>Edition</h3>
          <h3 className='w-1/5 text-center text-neutral-300 text-base font-bold'>Availability</h3>
          <h3 className='w-1/5 text-center text-neutral-300 text-base font-bold'>Actions</h3>
        </div>
        {
          books.map((book) => (
            <div key={book.id} className='text-sm p-4 border-t border-neutral-500 flex justify-around'>
              <p className='text-white w-1/5 text-center'>{book.title}</p>
              <p className='text-white w-1/5 text-center'>{book.author}</p>
              <p className='text-white w-1/5 text-center'>{book.edition}</p>
              <p className='text-white w-1/5 text-center'>{book.availability ? 'Yes' : 'No'}</p>
              <p className='w-1/5 text-center flex gap-1 flex-wrap justify-center'>
                <button onClick={() => handleEdit(book)} className='bg-blue-500 px-2 py-1 hover:bg-blue-600 transition-colors duration-300 hover:cursor-pointer text-white rounded font-medium'>Edit</button>
                <button onClick={() => handleDelete(book.id)} className='bg-red-500 px-2 py-1 ml-2 hover:bg-red-600 transition-colors duration-300 hover:cursor-pointer text-white rounded font-medium'>Delete</button>
              </p>
            </div>
          ))
        }
      </div>
    </div>
  )
}
