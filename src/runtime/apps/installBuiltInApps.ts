import {
  addComponentsDir,
  addPlugin,
  createResolver,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { registerTailwindPath } from '@owdproject/kit-primevue/kit/registerTailwindPath'
import { WIN95_THEME_BUILTIN_APPS } from './registry'

/** Register autoload built-in apps from `runtime/apps/<name>/`. */
export function installWin95BuiltInApps(nuxt: Nuxt, themeRoot: string) {
  const { resolve } = createResolver(themeRoot)

  for (const app of WIN95_THEME_BUILTIN_APPS) {
    if (!app.autoload) continue
    if (app.when && !app.when(nuxt)) continue

    const appRoot = resolve(`./runtime/apps/${app.name}`)

    addPlugin({
      src: resolve(appRoot, 'plugin.ts'),
      mode: 'client',
      name: `desktop-theme-win95-${app.name}`,
      order: 1,
    })

    addComponentsDir({
      path: resolve(appRoot, 'components'),
    })

    registerTailwindPath(
      nuxt,
      resolve(appRoot, 'components/**/*.{vue,mjs,ts}'),
    )
  }
}
