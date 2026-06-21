import { defineDesktopConfig } from '@owdproject/core'

export default defineDesktopConfig({
  theme: '@owdproject/theme-win95',
  modules: ['@owdproject/module-fs', '@owdproject/module-persistence'],
  apps: [
    '@owdproject/app-classic-audioplayer',
    '@owdproject/app-youtube',
    '@owdproject/app-soundcloud',
  ],
  systemBar: { enabled: true, startButton: true },
  fs: {
    mounts: {
      '/mnt/test': '/test-small.zip',
    },
  },
})
