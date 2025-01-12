import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config: UserConfig = {
    envDir: './env',
    plugins: [vue()],
    resolve: {
      alias: {
        '@domain': path.resolve(__dirname, 'src/domain'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@i18n': path.resolve(__dirname, 'src/i18n/index.ts'),
      },
    },
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
