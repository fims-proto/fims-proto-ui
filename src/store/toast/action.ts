import { toast } from 'vue-sonner'
import type { IMessageState, ToastMessage, ToastMessageOptions } from './state'

function add(state: IMessageState) {
  return (message: string, options?: ToastMessageOptions) => {
    state.message = {
      title: message,
      ...options,
      toastType: options?.toastType || 'default',
    }
    internalToast(state.message)
  }
}

function success(state: IMessageState) {
  return (message: string, options?: ToastMessageOptions) => {
    state.message = {
      title: message,
      ...options,
      toastType: 'success',
    }
    internalToast(state.message)
  }
}

function error(state: IMessageState) {
  return (message: string, options?: ToastMessageOptions) => {
    state.message = {
      title: message,
      ...options,
      toastType: 'error',
    }
    internalToast(state.message)
  }
}

function warn(state: IMessageState) {
  return (message: string, options?: ToastMessageOptions) => {
    state.message = {
      title: message,
      ...options,
      toastType: 'warning',
    }
    internalToast(state.message)
  }
}

function internalToast(m: ToastMessage) {
  const options = {
    toastType: m.toastType,
    description: m.description,
    duration: m.duration === -1 ? Infinity : m.duration,
    closeButton: m.closable,
  }
  switch (m.toastType) {
    case 'success':
      toast.success(m.title, options)
      return
    case 'warning':
      toast.warning(m.title, options)
      return
    case 'error':
      toast.error(m.title, options)
      return
    default:
      toast(m.title, options)
  }
}

export function createAction(state: IMessageState) {
  return { add: add(state), success: success(state), error: error(state), warn: warn(state) }
}
