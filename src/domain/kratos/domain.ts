import { AxiosError } from 'axios'
import type { LoginFlow, SettingsFlow } from '@ory/client'
import { kratos } from '../../lib/kratos'
import type { PasswordFlow, ProfileFlow, Response, Session } from './interface'
import { mapLoginFlow, mapPasswordFlow, mapProfileFlow, mapSession, mapSettingsFlow } from './helpers'

class KratosService {
  public async whoAmI(): Promise<Response<Session | undefined>> {
    try {
      return {
        ok: true,
        data: mapSession((await kratos.toSession()).data),
      }
    } catch (error) {
      console.error('session checking failed', error)
      return { ok: false, data: undefined }
    }
  }

  public async initLoginFlow(): Promise<Response<PasswordFlow | undefined>> {
    try {
      return {
        ok: true,
        data: mapPasswordFlow((await kratos.createBrowserLoginFlow({ refresh: true })).data),
      }
    } catch (error) {
      console.error(error)
      alert('Initiating login flow failed, error: ' + error)
      return { ok: false, data: undefined }
    }
  }

  public async submitLoginFlow(flow: PasswordFlow): Promise<Response<PasswordFlow | undefined>> {
    try {
      await kratos.updateLoginFlow({ flow: flow.flowId, updateLoginFlowBody: mapLoginFlow(flow) })
      return { ok: true, data: undefined }
    } catch (error) {
      return {
        ok: false,
        data: mapPasswordFlow((error as AxiosError).response?.data as LoginFlow),
      }
    }
  }

  public async initProfileSettingFlow(): Promise<Response<ProfileFlow | undefined>> {
    try {
      return {
        ok: true,
        data: mapProfileFlow((await kratos.createBrowserSettingsFlow()).data),
      }
    } catch (error) {
      console.error(error)
      alert('Initiating login flow failed, error: ' + error)
      return { ok: false, data: undefined }
    }
  }

  public async submitProfileSettingFlow(flow: ProfileFlow): Promise<Response<ProfileFlow | undefined>> {
    try {
      const data = (
        await kratos.updateSettingsFlow({
          flow: flow.flowId,
          updateSettingsFlowBody: mapSettingsFlow(flow),
        })
      ).data
      return { ok: true, data: mapProfileFlow(data) }
    } catch (error) {
      return {
        ok: false,
        data: mapProfileFlow((error as AxiosError).response?.data as SettingsFlow),
      }
    }
  }

  public async initPasswordSettingFlow(): Promise<Response<PasswordFlow | undefined>> {
    try {
      return {
        ok: true,
        data: mapPasswordFlow((await kratos.createBrowserSettingsFlow()).data),
      }
    } catch (error) {
      console.error(error)
      alert('Initiating login flow failed, error: ' + error)
      return { ok: false, data: undefined }
    }
  }

  public async submitPasswordSettingFlow(flow: PasswordFlow): Promise<Response<PasswordFlow | undefined>> {
    try {
      await kratos.updateSettingsFlow({
        flow: flow.flowId,
        updateSettingsFlowBody: mapSettingsFlow(flow),
      })
      return { ok: true, data: undefined }
    } catch (error) {
      return {
        ok: false,
        data: mapPasswordFlow((error as AxiosError).response?.data as SettingsFlow),
      }
    }
  }

  public async initLogoutFlow(): Promise<string | undefined> {
    const result = await kratos.createBrowserLogoutFlow()
    return result.data.logout_url
  }
}

export const KratosServiceInstance = new KratosService()
