import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import 'normalize.css'
import './assets/styles/presets.css'
import i18n from './i18n'

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app')
