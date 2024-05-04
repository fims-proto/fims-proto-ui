import type { SettingsFlow } from '@ory/kratos-client'
import type { UiNode, UiText } from '../../domain'
import { useNotificationStore } from '../../store/notification'

const notificationStore = useNotificationStore()

export interface profileFormType {
  csrf_token: string
  method: string
  traits: {
    email: string
    name: {
      first: string
      last: string
    }
  }
}

export interface passwordFormType {
  csrf_token: string
  method: string
  email: string
  password: string
}

function filterNodes(group: string, flow: SettingsFlow | undefined) {
  return flow?.ui.nodes.filter((node) => node.group == 'default' || node.group == group)
}

function getValue(attr: string, uiNodes: UiNode[] | undefined) {
  return uiNodes?.find((node) => node.attributes.name == attr)?.attributes.value
}

export function buildProfileForm(flow: SettingsFlow | undefined): profileFormType {
  const uiNodes = filterNodes('profile', flow) as UiNode[]

  return {
    csrf_token: getValue('csrf_token', uiNodes) ?? '',
    method: getValue('method', uiNodes) ?? '',
    traits: {
      email: getValue('traits.email', uiNodes) ?? '',
      name: {
        first: getValue('traits.name.first', uiNodes) ?? '',
        last: getValue('traits.name.last', uiNodes) ?? '',
      },
    },
  }
}

export function buildPasswordForm(flow: SettingsFlow | undefined): passwordFormType {
  const uiNodes = filterNodes('password', flow) as UiNode[]

  return {
    csrf_token: getValue('csrf_token', uiNodes) ?? '',
    method: getValue('method', uiNodes) ?? '',
    email: getValue('traits.email', filterNodes('profile', flow) as UiNode[]) ?? '',
    password: getValue('password', uiNodes) ?? '',
  }
}

export function notify(flow: SettingsFlow | undefined) {
  const convertMessageType = (type: string) => {
    switch (type) {
      case 'error':
      case 'info':
      case 'success':
      case 'warning':
        return type
      default:
        return 'error'
    }
  }
  const createMessage = (message: UiText) => ({
    type: convertMessageType(message.type),
    text: message.text,
  })

  let messages = flow?.ui.messages?.map(createMessage) ?? []
  messages = messages.concat(flow?.ui.nodes.flatMap((node) => node.messages).map(createMessage) ?? [])
  messages.forEach((message) =>
    notificationStore.action.push({
      type: message.type,
      message: message.text,
      duration: message.type === 'error' || message.type === 'warning' ? 0 : undefined,
    }),
  )
}
