export interface Book {
  id: string
  title: string
  author: string
  edition: string
  availability: boolean
}
export interface CreateBookForm {
  title: string
  author: string
  edition: string
  availability: boolean
}
