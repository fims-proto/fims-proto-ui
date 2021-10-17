import { Session, SubmitSelfServiceLoginFlowWithPasswordMethodBody, SubmitSelfServiceSettingsFlowBody } from '@ory/kratos-client'
import axios, { AxiosError } from 'axios'
import { kratos } from '../lib/kratos'
import { KratosFlow, SubmitLoginResult, SubmitSettingResult } from '../types'

class FlowRepository {
  public async whoAmI(): Promise<Session | undefined> {
    try {
      const result = await kratos.toSession()

      return result.data
    } catch (error) {
      console.error(error)
    }
  }

  public async initLoginFlow(): Promise<KratosFlow | undefined> {
    try {
      const result = await kratos.initializeSelfServiceLoginFlowForBrowsers()

      return result.data as KratosFlow
    } catch (error) {
      console.error(error)
    }
  }

  public async submitLoginFlow(flowId: string, payload: SubmitSelfServiceLoginFlowWithPasswordMethodBody): Promise<SubmitLoginResult> {
    try {
      const result = await kratos.submitSelfServiceLoginFlow(flowId, payload)

      return {
        data: result.data
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async initSettingFlow(): Promise<KratosFlow | undefined> {
    try {
      const result = await kratos.initializeSelfServiceSettingsFlowForBrowsers()

      return result.data as KratosFlow
    } catch (error) {
      console.log(error)
    }
  }

  public async submitSettingFlow(flowId: string, payload: SubmitSelfServiceSettingsFlowBody): Promise<SubmitSettingResult> {
    try {
      const result = await kratos.submitSelfServiceSettingsFlow(flowId, undefined, payload)

      return {
        data: result.data
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async initLogoutFlow(): Promise<string | undefined> {
    try {
      const result = await kratos.createSelfServiceLogoutFlowUrlForBrowsers()
      return result.data.logout_url
    } catch (error) {
      console.log(error)
    }
  }

  private handleError(error: unknown) {
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

export default new FlowRepository()