import { Pool } from 'pg'
import { Book, BookCreate, BookUpdate } from '../types/BookTypes'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://ariel:ariel@localhost:5432/library_db',
})

interface Props {
  text: string
  params?: any[]
}

const query = async ({ text, params }: Props) => {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export class BookModel {
  static async getAll (): Promise<Book[]> {
    try {
      const result = await query(
        {
          text: 'SELECT * FROM book;'
        }
      )
      return result.rows
    } catch (error: unknown) {
      console.error('Error fetching books:', error)
      throw new Error('Could not fetch books')
    }
  }

  static async getById ({ id }: { id: string }): Promise<Book | null> {
    try {
      const result = await query(
        {
          text: 'SELECT * FROM book WHERE id = $1;',
          params: [id]
        }
      )
      return result.rows[0] || null
    } catch (error: unknown) {
      console.error('Error fetching book by ID:', error)
      throw new Error('Could not fetch book by ID')
    }
  }

  static async create ({ input }: { input: BookCreate }): Promise<Book> {
    try {
      const { title, author, edition = '', availability = true } = input
      const id = crypto.randomUUID()

      await query({
        text: 'INSERT INTO book (id, title, author, edition, availability) VALUES ($1, $2, $3, $4, $5);',
        params: [id, title, author, edition, availability]
      })

      const book = await query({
        text: 'SELECT * FROM book WHERE id = $1;',
        params: [id]
      })
      return book.rows[0]
    } catch (error: unknown) {
      console.error('Error creating book:', error)
      throw new Error('Could not create book')
    }
  }

  static async update ({ id, input }: { id: string, input: BookUpdate }): Promise<Book | null> {
    try {
      const book = await this.getById({ id })
      if (!book) return null
      const updatedBook = { ...book, ...input }
      await query({
        text: 'UPDATE book SET title = $1, author = $2, edition = $3, availability = $4 WHERE id = $5;',
        params: [updatedBook.title, updatedBook.author, updatedBook.edition, updatedBook.availability, id]
      })
      return updatedBook
    } catch (error: unknown) {
      console.error('Error updating book:', error)
      throw new Error('Could not update book')
    }
  }

  static async delete ({ id }: { id: string }): Promise<boolean> {
    try {
      const book = await this.getById({ id })
      if (!book) return false
      await query({
        text: 'DELETE FROM book WHERE id = $1;',
        params: [id]
      })
      return true
    } catch (error: unknown) {
      console.error('Error deleting book:', error)
      throw new Error('Could not delete book')
    }
  }
}
