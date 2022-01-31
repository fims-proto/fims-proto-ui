export interface Period {
  id: string,
  previousPeriodId?: string,
  sobId: string,
  financialYear: number,
  number: number,
  openingTime: string,
  endingTime?: string,
  isClosed: boolean,
  createdAt: string,
  updatedAt: string
}