import {
  type LoginFlow,
  type SettingsFlow,
  type Session,
  type UpdateLoginFlowBody,
  type UpdateSettingsFlowBody,
  type SuccessfulNativeLogin,
} from '@ory/kratos-client'
import axios, { AxiosError } from 'axios'
import { kratos } from '../../lib/kratos'
import type { KratosResponse } from './types'

class KratosService {
  public async whoAmI(): Promise<KratosResponse<Session | undefined>> {
    try {
      return {
        ok: true,
        data: (await kratos.toSession()).data,
      }
    } catch (error) {
      console.error('session checking failed', error)
      return {
        ok: false,
        data: undefined,
      }
    }
  }

  public async initLoginFlow(): Promise<LoginFlow> {
    try {
      const result = await kratos.createBrowserLoginFlow({ refresh: true })
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data as LoginFlow
    }
  }

  public async submitLoginFlow(
    flowId: string,
    payload: UpdateLoginFlowBody,
  ): Promise<SuccessfulNativeLogin | LoginFlow> {
    try {
      const result = await kratos.updateLoginFlow({ flow: flowId, updateLoginFlowBody: payload })
      return result.data
    } catch (error) {
      return (error as AxiosError).response?.data as LoginFlow
    }
  }

  public async initSettingFlow(): Promise<KratosResponse<SettingsFlow | undefined>> {
    try {
      return {
        ok: true,
        data: (await kratos.createBrowserSettingsFlow()).data,
      }
    } catch (error) {
      console.error('initiating setting flow failed', error)
      return {
        ok: false,
        data: undefined,
      }
    }
  }

  public async submitSettingFlow(
    flowId: string,
    payload: UpdateSettingsFlowBody,
  ): Promise<KratosResponse<SettingsFlow>> {
    try {
      const result = await kratos.updateSettingsFlow({ flow: flowId, updateSettingsFlowBody: payload })
      return {
        ok: true,
        data: result.data,
      }
    } catch (error) {
      return {
        ok: false,
        data: (error as AxiosError).response?.data as SettingsFlow,
      }
    }
  }

  public async initLogoutFlow(): Promise<string | undefined> {
    const result = await kratos.createBrowserLogoutFlow()
    return result.data.logout_url
  }
}

export const KratosServiceInstance = new KratosService()
