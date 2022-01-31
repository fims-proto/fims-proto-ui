import { JsonError, SelfServiceLoginFlow, SelfServiceSettingsFlow, Session, SubmitSelfServiceLoginFlowWithPasswordMethodBody, SubmitSelfServiceSettingsFlowBody, SuccessfulSelfServiceLoginWithoutBrowser } from '@ory/kratos-client'
import axios, { AxiosError } from 'axios'
import { kratos } from '../lib/kratos'

class KratosService {
  public async whoAmI(): Promise<Session | undefined> {
    try {
      const result = await kratos.toSession()

      return result.data
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.data.error.code != '401') {
        console.error(error)
      }
    }
  }

  public async initLoginFlow(): Promise<SelfServiceLoginFlow | JsonError> {
    try {
      const result = await kratos.initializeSelfServiceLoginFlowForBrowsers()
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data
    }
  }

  public async submitLoginFlow(flowId: string, payload: SubmitSelfServiceLoginFlowWithPasswordMethodBody): Promise<SuccessfulSelfServiceLoginWithoutBrowser | SelfServiceLoginFlow> {
    try {
      const result = await kratos.submitSelfServiceLoginFlow(flowId, undefined, payload)
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data
    }
  }

  public async initSettingFlow(): Promise<SelfServiceSettingsFlow | undefined> {
    const result = await kratos.initializeSelfServiceSettingsFlowForBrowsers()

    return result.data
  }

  public async submitSettingFlow(flowId: string, payload: SubmitSelfServiceSettingsFlowBody): Promise<SelfServiceSettingsFlow> {
    try {
      const result = await kratos.submitSelfServiceSettingsFlow(flowId, undefined, payload)
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data
    }
  }

  public async initLogoutFlow(): Promise<string | undefined> {
    const result = await kratos.createSelfServiceLogoutFlowUrlForBrowsers()
    return result.data.logout_url
  }
}

export const KratosServiceInstance = new KratosService()