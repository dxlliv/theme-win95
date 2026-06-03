<script setup lang="ts">
import { ref } from 'vue'
import { useSystemBar } from '../composables/useSystemBar'
import { useDesktopSession } from '@owdproject/kit-theme/runtime/composables/useDesktopSession'
import { useBlockNonInputContextMenu } from '@owdproject/kit-theme/runtime/composables/useBlockNonInputContextMenu'
import { useDesktopWorkArea } from '@owdproject/kit-theme/runtime/composables/useDesktopWorkArea'
import {
  provideDesktopShellStage,
  provideDesktopWorkArea,
} from '@owdproject/kit-theme/runtime/composables/provideDesktopShellStage'
import Win95WindowSnapHints from './Win95WindowSnapHints.vue'

const systemBar = useSystemBar()
const { shuttingDown } = useDesktopSession()

useBlockNonInputContextMenu()

const shellStageRef = ref<HTMLElement | null>(null)
const { workArea } = useDesktopWorkArea(shellStageRef)
provideDesktopShellStage(shellStageRef)
provideDesktopWorkArea(workArea)
</script>

<template>
  <DesktopCore v-bind="$props">
    <Background />

    <Win95WindowSnapHints />

    <div ref="shellStageRef" class="win95-shell__stage">
      <DesktopContent>
        <slot />
      </DesktopContent>

      <DesktopApplicationRender />
    </div>

    <SystemBar
      v-if="systemBar?.enabled.value"
    />

    <DesktopShutdown
      :active="shuttingDown"
    />
  </DesktopCore>
</template>

<style lang="scss">
@use '../assets/styles/index.scss';

.win95-shell__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.owd-desktop {
  display: flex;
  flex-direction: column;
  font-family: var(--owd-font-family), serif;
  font-size: var(--p-font-size);

  button {
    font-family: var(--owd-font-family), serif;
  }

  &__system-bar {
    &--position-bottom {
      flex-direction: column-reverse;
    }
  }
}
</style>
