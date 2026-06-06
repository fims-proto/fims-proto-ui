import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import type { CashFlowItem } from './types'

class CashFlowItemService {
  public async getCashFlowItems(sobId: string): Promise<Response<CashFlowItem[]>> {
    return invokeWithErrorHandler(async () => {
      return (await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/cash-flow-items`)).data
    })
  }
}

export const CashFlowItemServiceInstance = new CashFlowItemService()
