<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import { useI18n } from 'vue-i18n'
import type { IWindowController } from '@owdproject/core'
import { createExplorerWindowMenuItems } from '@owdproject/module-fs/runtime/composables/useExplorerWindowMenu'

const props = defineProps<{
  window: IWindowController
}>()

const { t } = useI18n()
const confirm = useConfirm()

const explorerMenu = createExplorerWindowMenuItems(
  () => props.window,
  t,
  () =>
    confirm.require({
      group: 'about',
      header: 'About',
      acceptProps: {
        label: 'OK',
        class: 'p-button--primary',
      },
      rejectProps: {
        class: 'hidden',
      },
      accept: () => {},
    }),
)

props.window.setMenu(explorerMenu)
</script>

<template>
  <DesktopExplorerWorkspace
    :window="window"
    frame-class="win95-explorer-frame"
  >
    <template #nav>
      <DesktopWindowNav />
    </template>
  </DesktopExplorerWorkspace>
</template>
