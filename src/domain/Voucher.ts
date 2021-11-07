import axios from 'axios'

class Voucher {
  public async getAllVouchersBySod(sob: string) {
    try {
      const result = await axios.get(`/fims/api/v1/vouchers/${sob}/`)
      return result.data
    } catch (error) {
      alert(error)
    }
  }
}

export default new Voucher()