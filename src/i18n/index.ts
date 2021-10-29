import { createI18n } from 'vue-i18n'

const modules = import.meta.globEager('./*')

function getLangFiles(modules: Record<string, { [key: string]: any }>) {
  let messages: any = {}

  for (let path in modules) {
    if (modules[path].default) {
      const pathName = path.substr(path.lastIndexOf('/') + 1, 5) // e.g.: en-US

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
  locale: navigator.language,
  fallbackLocale: 'en-US',
  messages: getLangFiles(modules)
})

export default i18n