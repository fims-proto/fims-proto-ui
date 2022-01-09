import axios from 'axios'
import { FIMS_URL } from '../config'

class Sob {
  public async getAllSods() {
    try {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/`)
      return result.data
    } catch (error) {
      alert(error)
    }
  }
}

export default new Sob()