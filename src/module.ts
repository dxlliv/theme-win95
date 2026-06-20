import {
  createResolver,
  addComponentsDir,
  addImportsDir,
  installModule,
} from '@nuxt/kit'
import { defineDesktopTheme } from '@owdproject/core'
import {
  registerTailwindPath,
  registerThemeTailwindPath,
} from '@owdproject/kit-tailwind/kit/registerTailwindPath'
import { installWin95BuiltInApps } from './runtime/apps/installBuiltInApps'

export default defineDesktopTheme({
  meta: {
    name: 'desktop-theme-win95',
  },
  defaults: {
    name: 'win95',
    systemBar: {
      enabled: true,
      position: 'bottom',
      startButton: true,
    },
    windows: {
      position: 'fixed',
    },
    fs: {
      defaultUserHome: '/Users/Guest',
      mounts: {
        '/Users': 'WebStorage',
      },
    },
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    await installModule('@owdproject/kit-primevue')

    registerThemeTailwindPath(nuxt, import.meta.url)
    registerTailwindPath(nuxt, resolve('./runtime/pages/**/*.{vue,mjs,ts}'))

    // Win95 chrome is SCSS-driven; Tailwind preflight resets break PrimeVue / theme partials.
    nuxt.hook('tailwindcss:config', (config) => {
      config.corePlugins = { ...(config.corePlugins ?? {}), preflight: false }
    })

    nuxt.options.css.push(resolve('./runtime/assets/styles/index.scss'))

    addComponentsDir({
      path: resolve('./runtime/components'),
      pathPrefix: false,
    })

    nuxt.hook('i18n:registerModule', (register) => {
      register({
        langDir: resolve('./i18n'),
        locales: [
          {
            code: 'en',
            file: 'locales/en.ts',
          },
        ],
      })
    })

    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/consts'))
    addImportsDir(resolve('./runtime/stores'))
    addImportsDir(resolve('./runtime/utils'))

    installWin95BuiltInApps(nuxt, import.meta.url)
  },
})
