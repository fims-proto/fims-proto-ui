export interface ColumnType {
  title: string
  path?: string | string[]
  key?: string
  align?: 'left' | 'right' | 'center'
  width?: 'sm' | 'md' | 'lg'
}

export interface PageType {
  currentPage: number
  totalElement: number
  pageSize?: number
}
