// ts doesn't allow circularly references for now, so this is a workaround
type FieldConversionRecursiveRecord<T> = Record<string, 'number' | 'date' | T>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FieldConversionRecord extends FieldConversionRecursiveRecord<FieldConversionRecord> {}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  total: number
  numberOfElements: number
  isFirst: boolean
  isLast: boolean
}

export interface Pageable {
  page: number
  size: number
}

export interface AppNotification {
  id?: string
  type?: 'error' | 'info' | 'success' | 'warning'
  duration?: number
  closable?: boolean
  message: string
}
