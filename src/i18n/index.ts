import { createI18n } from 'vue-i18n'

const modules = import.meta.globEager('./*')

function getLangFiles(modules: Record<string, { [key: string]: any }>) {
  let messages: any = {}

  for (let path in modules) {
    if (modules[path].default) {
      const pathName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')) // e.g.: en-US

      if (messages[pathName]) {
        messages[pathName] = {
          ...modules[pathName],
          ...modules[path].default
        }
      } else {
        messages[pathName] = modules[path].default
      }
    }
  }

  return messages
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: getLangFiles(modules),
  datetimeFormats: {
    'zh': {
      date: {
        year: 'numeric', month: 'short', day: 'numeric', timezone: 'Asia/Shanghai'
      },
      datetime: {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timezone: 'Asia/Shanghai'
      }
    }
  },
  numberFormats: {
    'zh': {
      cur: {
        style: 'currency', currency: 'CNY'
      },
      dec: {
        style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
      }
    }
  }
})

export default i18n