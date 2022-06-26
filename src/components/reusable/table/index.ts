import { VNode } from 'vue'

export interface ColumnType<T> {
  title: string
  path?: string | string[]
  key?: string
  align?: 'left' | 'right' | 'center'
  width?: string
  render?(value: string | Date | number, record: T, index: number): string | VNode
}

export interface PageType {
  currentPage: number
  totalElement: number
  pageSize?: number
}
