import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { HeadlessUiResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5001,
  },
  plugins: [
    vue(),
    Components({
      resolvers: [HeadlessUiResolver(), VueUseComponentsResolver(), HeroiconsResolver()],
    }),
  ],
})

function HeroiconsResolver() {
  return (name: string) => {
    if (name.endsWith('SolidIcon')) {
      return {
        name: `${name.substring(0, name.length - 9)}Icon`,
        from: '@heroicons/vue/24/solid',
      }
    } else if (name.endsWith('MiniIcon')) {
      return {
        name: `${name.substring(0, name.length - 8)}Icon`,
        from: '@heroicons/vue/20/solid',
      }
    }
  }
}
