import { Router } from 'express'
import { BookModel } from '../models/book'
import { BookController } from '../controllers/book'

interface CreateBookRouterOptions {
  bookModel: typeof BookModel
}

export const createBookRouter = ({ bookModel }: CreateBookRouterOptions): Router => {
  const booksRouter = Router()
  const bookController = new BookController({ bookModel })

  booksRouter.get('/', bookController.getAll)
  booksRouter.get('/:id', bookController.getById)
  booksRouter.post('/', bookController.create)
  booksRouter.put('/:id', bookController.update)
  booksRouter.delete('/:id', bookController.delete)

  return booksRouter
}
