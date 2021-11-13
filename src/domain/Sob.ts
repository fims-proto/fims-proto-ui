import axios from 'axios'

class Sob {
  public async getAllSods() {
    try {
      const result = await axios.get(`/fims/api/v1/sobs/`)
      return result.data
    } catch (error) {
      alert(error)
    }
  }
}

export default new Sob()