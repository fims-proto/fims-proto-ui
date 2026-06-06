export interface Page<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalPage: number
  numberOfElements: number
}

export interface Pageable {
  page: number
  size: number
}
