import {
  LoginFlow,
  SettingsFlow,
  Session,
  UpdateLoginFlowBody,
  UpdateSettingsFlowBody,
  SuccessfulNativeLogin,
} from '@ory/kratos-client'
import axios, { AxiosError } from 'axios'
import { kratos } from '../../lib/kratos'

class KratosService {
  public async whoAmI(): Promise<Session | undefined> {
    try {
      const result = await kratos.toSession()

      return result.data
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        console.error(error)
      }
    }
  }

  public async initLoginFlow(): Promise<LoginFlow> {
    try {
      const result = await kratos.createBrowserLoginFlow()
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data as LoginFlow
    }
  }

  public async submitLoginFlow(
    flowId: string,
    payload: UpdateLoginFlowBody
  ): Promise<SuccessfulNativeLogin | LoginFlow> {
    try {
      const result = await kratos.updateLoginFlow({ flow: flowId, updateLoginFlowBody: payload })
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data as LoginFlow
    }
  }

  public async initSettingFlow(): Promise<SettingsFlow | undefined> {
    const result = await kratos.createBrowserSettingsFlow()

    return result.data
  }

  public async submitSettingFlow(flowId: string, payload: UpdateSettingsFlowBody): Promise<SettingsFlow> {
    try {
      const result = await kratos.updateSettingsFlow({ flow: flowId, updateSettingsFlowBody: payload })
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data as SettingsFlow
    }
  }

  public async initLogoutFlow(): Promise<string | undefined> {
    const result = await kratos.createBrowserLogoutFlow()
    return result.data.logout_url
  }
}

export const KratosServiceInstance = new KratosService()
