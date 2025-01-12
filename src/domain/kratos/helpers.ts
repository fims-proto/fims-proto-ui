import type {
  Session as KratosSession,
  LoginFlow,
  SettingsFlow,
  UiNodeInputAttributes,
  UiText,
  UpdateLoginFlowBody,
  UpdateSettingsFlowBody,
} from '@ory/client'
import type { PasswordFlow, ProfileFlow, Session } from './interface'
import { useToastStore } from '@store/toast'

export function mapSession(kratosSession: KratosSession): Session {
  const lastAuthenticationMethod = kratosSession.authentication_methods
    ?.map((a) => ({ ...a, completed_at: a.completed_at ? Date.parse(a.completed_at) : 0 }))
    .sort((a, b) => b.completed_at - a.completed_at)
    .at(0)?.method

  if (lastAuthenticationMethod !== 'link_recovery' && lastAuthenticationMethod !== 'password') {
    throw `Unexpected authentication method: ${lastAuthenticationMethod}`
  }

  return {
    id: kratosSession.identity?.id,
    name: {
      first: kratosSession.identity?.traits.name.first,
      last: kratosSession.identity?.traits.name.last,
    },
    email: kratosSession.identity?.traits.email,
    authenticationMethod: lastAuthenticationMethod,
  }
}

export function mapPasswordFlow(flow: LoginFlow | SettingsFlow): PasswordFlow {
  // message from Kratos will be sent together in the original flow
  notify(flow)

  return {
    flowId: flow.id,
    method: 'password',
    identifier: getValue(flow, 'password', 'identifier') ?? getValue(flow, 'profile', 'traits.email') ?? '',
    password: getValue(flow, 'password', 'password') ?? '',
    csrfToken: getValue(flow, 'default', 'csrf_token') ?? '',
  }
}

export function mapLoginFlow(flow: PasswordFlow): UpdateLoginFlowBody {
  return {
    method: 'password',
    identifier: flow.identifier,
    password: flow.password,
    csrf_token: flow.csrfToken,
  }
}

export function mapProfileFlow(flow: SettingsFlow): ProfileFlow {
  // message from Kratos will be sent together in the original flow
  notify(flow)

  return {
    flowId: flow.id,
    method: 'profile',
    email: getValue(flow, 'profile', 'traits.email') ?? '',
    name: {
      first: getValue(flow, 'profile', 'traits.name.first') ?? '',
      last: getValue(flow, 'profile', 'traits.name.last') ?? '',
    },
    csrfToken: getValue(flow, 'default', 'csrf_token') ?? '',
  }
}

export function mapSettingsFlow(flow: PasswordFlow | ProfileFlow): UpdateSettingsFlowBody {
  switch (flow.method) {
    case 'password':
      return {
        csrf_token: flow.csrfToken,
        method: flow.method,
        password: flow.password,
      }
    case 'profile':
      return {
        csrf_token: flow.csrfToken,
        method: flow.method,
        traits: {
          email: flow.email,
          name: {
            first: flow.name.first,
            last: flow.name.last,
          },
        },
      }
  }
}

const MESSAGE_TYPE_MAP: {
  [key: string]: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined
} = {
  info: 'info',
  success: 'success',
  warning: 'warn',
  error: 'error',
}

function notify(flow: LoginFlow | SettingsFlow | undefined) {
  const createMessage = (message: UiText) => ({
    type: MESSAGE_TYPE_MAP[message.type],
    text: message.text,
  })

  let messages = flow?.ui.messages?.map(createMessage) ?? []
  messages = messages.concat(flow?.ui.nodes.flatMap((node) => node.messages).map(createMessage) ?? [])
  messages.forEach((message) =>
    useToastStore().action.add({
      severity: message.type,
      detail: message.text,
    }),
  )
}

function getValue(flow: LoginFlow | SettingsFlow, group: 'default' | 'profile' | 'password', attr: string) {
  const node = flow.ui.nodes
    .filter((node) => node.group === 'default' || node.group === group)
    .find((node) => (node.attributes as UiNodeInputAttributes).name === attr)

  return (node?.attributes as UiNodeInputAttributes)?.value
}
