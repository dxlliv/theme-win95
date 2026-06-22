import { defineDesktopConfig } from '@owdproject/core'

export default defineDesktopConfig({
  theme: '@owdproject/theme-win95',
  modules: ['@owdproject/module-fs', '@owdproject/module-persistence'],
  apps: [
    '@owdproject/app-classic-audioplayer',
    '@owdproject/app-classic-videoplayer',
    '@owdproject/app-wasmboy',
    '@owdproject/app-terminal',
    '@owdproject/app-youtube',
    '@owdproject/app-soundcloud',
  ],
  systemBar: { enabled: true, startButton: true },
  terminal: {
    welcomeMessage: 'Microsoft Windows 95',
    prompt: 'C:\\>',
  },
  fs: {
    mounts: {
      '/mnt/test': '/test-small.zip',
    },
  },
})
