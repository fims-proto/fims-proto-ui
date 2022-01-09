import axios from 'axios'
import { FIMS_URL } from '../config'

class Voucher {
  public async getAllVouchersBySod(sob: string) {
    try {
      const result = await axios.get(`${FIMS_URL}/api/v1/vouchers/${sob}/`)
      return result.data
    } catch (error) {
      alert(error)
    }
  }
}

export default new Voucher()