import express, { Express } from 'express'
import { BookModel } from './models/book'
import { createBookRouter } from './routes/book'
import { corsMiddleware } from './middlewares/cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './utils/swagger'

interface CreateAppOptions {
  bookModel: typeof BookModel
}

export const createApp = ({ bookModel }: CreateAppOptions): Express => {
  const app = express()
  app.use(express.json())
  app.disable('x-powered-by')
  app.use(corsMiddleware())

  app.use('/api/books', createBookRouter({ bookModel }))
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`)
  })

  return app
}
