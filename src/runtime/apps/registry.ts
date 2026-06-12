import type { Nuxt } from '@nuxt/schema'

/**
 * Built-in Win95 theme apps under `runtime/apps/<name>/`.
 * Explorer expects `@owdproject/module-fs` in `desktop.config.ts` `modules`.
 */
export type Win95ThemeBuiltInApp = {
  name: string
  autoload: boolean
  when?: (nuxt: Nuxt) => boolean
}

export function hasModuleFs(nuxt: Nuxt): boolean {
  const desktop = nuxt.options.runtimeConfig.public.desktop as {
    modules?: string[]
  }
  const modules = desktop?.modules ?? []
  return modules.some((m) => String(m).includes('module-fs'))
}

export const WIN95_THEME_BUILTIN_APPS: Win95ThemeBuiltInApp[] = [
  { name: 'calculator', autoload: true },
  // Explorer is always registered with the Win95 theme; module-fs supplies the VFS at runtime.
  { name: 'explorer', autoload: true },
]
