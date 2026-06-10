import { defineNuxtPlugin } from 'nuxt/app'
import { useConfirm } from 'primevue/useconfirm'
import { DESKTOP_DIALOG_PROVIDER_KEY } from '@owdproject/core/runtime/constants/desktopShellKeys'
import { createDesktopDialogs } from '@owdproject/kit-primevue/runtime/dialogs/createDesktopDialogs'

export default defineNuxtPlugin({
  name: 'desktop-theme-win95-dialogs',
  enforce: 'post',
  setup(nuxtApp) {
    const confirm = useConfirm()
    nuxtApp.vueApp.provide(
      DESKTOP_DIALOG_PROVIDER_KEY,
      createDesktopDialogs(confirm),
    )
  },
})
