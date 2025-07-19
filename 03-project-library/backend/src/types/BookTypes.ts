export interface Book {
  id: string
  title: string
  author: string
  edition: string
  availability: boolean
}

export interface BookCreate {
  title: string
  author: string
  edition?: string
  availability?: boolean
}

export interface BookUpdate {
  title?: string
  author?: string
  edition?: string
  availability?: boolean
}
