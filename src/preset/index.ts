import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import base from './base'
import menubar from './menubar'

export default definePreset(Aura, {
  ...base,
  components: {
    menubar,
  },
})
