import { SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody } from '@ory/kratos-client'
import axios, { AxiosError } from 'axios'
import { KRATOS_URL } from '../config'
import { SubmitLoginResult } from '../types'

export class Auth {
  static isLoggedIn(): boolean {
    return false
  }
}

export class FlowRepository {
  static async initLoginFlow(): Promise<SelfServiceLoginFlow | undefined> {
    try {
      // seems kratos client does not work:
      // const result = await kratos.initializeSelfServiceLoginFlowForBrowsers()
      // use axios get directly:
      const result = await axios.get(`${KRATOS_URL}/self-service/login/browser`, {
        withCredentials: true
      })

      return result.data
    } catch (error) {
      console.error(error);
    }
  }

  static async submitLoginFlow(flowId: string, payload: SubmitSelfServiceLoginFlowWithPasswordMethodBody): Promise<SubmitLoginResult> {
    try {
      // seems kratos client does not work:
      // const result = await kratos.submitSelfServiceLoginFlow(flowId, payload)
      // use axios post directly:
      const result = await axios.post(`${KRATOS_URL}/self-service/login?flow=${flowId}`, payload, {
        withCredentials: true
      })

      return {
        data: result.data
      }
    } catch (error) {
      if (axios.isAxiosError(error) && (error as AxiosError).response?.status == 400) {
        return {
          flow: (error as AxiosError).response?.data
        }
      }
      return {
        error: (error as Error)
      }
    }
  }
}