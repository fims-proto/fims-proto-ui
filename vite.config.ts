import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config: UserConfig = {
    envDir: './env',
    plugins: [vue()],
  }

  if (command === 'serve') {
    // dev
    config.server = {
      host: '127.0.0.1',
      port: 5001,
    }
    return config
  } else {
    // build
    return config
  }
})
