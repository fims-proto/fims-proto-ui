// export interface Period {
//   id: string
//   sobId: string
//   previousPeriodId: string
//   fiscalYear: number
//   periodNumber: number
//   openingTime: Date
//   endingTime: Date
//   isClosed: boolean
//   isCurrent: boolean
//   updatedAt: Date
//   createdAt: Date
// }

import type { z } from 'zod'
import type { PeriodSchema } from './schemas'

export type Period = z.infer<typeof PeriodSchema>
