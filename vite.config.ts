import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5001,
  },
  plugins: [
    vue(),
    Components({
      resolvers: [
        HeadlessUiResolver(),
        // for heroicons
        (name: string) => {
          if (name.endsWith('SolidIcon')) {
            return {
              importName: `${name.substring(0, name.length - 9)}Icon`,
              path: '@heroicons/vue/solid',
            }
          } else if (name.endsWith('OutlineIcon')) {
            return {
              importName: `${name.substring(0, name.length - 11)}Icon`,
              path: '@heroicons/vue/outline',
            }
          }
        },
      ],
    }),
  ],
})
