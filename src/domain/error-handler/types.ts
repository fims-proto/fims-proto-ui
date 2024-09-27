export interface SlugError {
  slug: string
  message: string
}

export interface Response<T> {
  data?: T
  exception?: SlugError
}
