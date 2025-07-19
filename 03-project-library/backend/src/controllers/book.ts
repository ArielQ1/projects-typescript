import { Request, Response } from 'express'
import { BookModel } from '../models/book'
import { Book } from '../types/BookTypes'
import { validateBook, validatePartialBook } from '../schemas/books'

interface BookControllerParams {
  bookModel: typeof BookModel
}

export class BookController {
  private BookModel: typeof BookModel

  constructor ({ bookModel }: BookControllerParams) {
    this.BookModel = bookModel
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const books: Book[] = await this.BookModel.getAll()
      res.status(200).json(books)
    } catch (error) {
      console.error('Error fetching books:', error)
      res.status(500).json({ error: 'Could not fetch books' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const book = await this.BookModel.getById({ id })
      if (book) {
        res.status(200).json(book)
        return
      }
      res.status(404).json({ error: 'Book not found' })
    } catch (error) {
      console.error('Error fetching book by ID:', error)
      res.status(500).json({ error: 'Could not fetch book by ID' })
    }
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = validateBook(req.body)
      if (!input.success) {
        res.status(400).json({ error: 'Invalid book data', details: input.error })
        return
      }
      const book = await this.BookModel.create({ input: input.data })
      res.status(201).json(book)
    } catch (error) {
      console.error('Error creating book:', error)
      res.status(500).json({ error: 'Could not create book' })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = validatePartialBook(req.body)
      if (!input.success) {
        res.status(400).json({ error: 'Invalid book data', details: input.error })
        return
      }
      const { id } = req.params
      const book = await this.BookModel.update({ id, input: input.data })
      if (!book) {
        res.status(404).json({ error: 'Book not found' })
        return
      }
      res.status(200).json(book)
    } catch (error) {
      console.error('Error updating book:', error)
      res.status(500).json({ error: 'Could not update book' })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const deleted = await this.BookModel.delete({ id })
      if (!deleted) {
        res.status(404).json({ error: 'Book not found' })
        return
      }
      res.json({ message: 'Book deleted successfully' })
    } catch (error) {
      console.error('Error deleting book:', error)
      res.status(500).json({ error: 'Could not delete book' })
    }
  }
}
