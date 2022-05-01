export interface Sob {
  id: string,
  name: string,
  description?: string
  baseCurrency: string,
  startingPeriodYear: number,
  startingPeriodMonth: number,
  accountsCodeLength: number[]
}

export interface NewSob {
  name: string,
  description?: string
  baseCurrency: string,
  startingPeriodYear: number,
  startingPeriodMonth: number,
  accountsCodeLength: number[]
}