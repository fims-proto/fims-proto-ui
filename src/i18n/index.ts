import { createI18n } from 'vue-i18n'
import zhCN from './zhCN.json'

// Type-define 'zh' as the master schema for the resource
type MessageSchema = typeof zhCN

const i18n = createI18n<MessageSchema[], 'zh-CN'>({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    // en,
  },
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
      date: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      datetime: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
})

export default i18n
