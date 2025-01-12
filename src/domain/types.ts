// ts doesn't allow circularly references for now, so this is a workaround
type FieldConversionRecursiveRecord<T> = Record<string, 'number' | 'date' | T>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FieldConversionRecord extends FieldConversionRecursiveRecord<FieldConversionRecord> {}

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
