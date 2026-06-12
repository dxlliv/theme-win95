import { defineNuxtPlugin } from 'nuxt/app'
import { defineDesktopApp } from '@owdproject/core/kit/defineDesktopApp'
import configAppExplorer from './app.config'

export default defineNuxtPlugin({
  name: 'desktop-theme-win95-explorer',
  dependsOn: ['pinia', 'desktop-shell-init'],
  async setup() {
    if (import.meta.server) return
    await defineDesktopApp(configAppExplorer)
  },
})
