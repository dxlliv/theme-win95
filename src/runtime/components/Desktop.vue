<script setup lang="ts">
import { ref } from 'vue'
import { useSystemBar } from '../composables/useSystemBar'
import { useDesktopSession } from '@owdproject/core/runtime/composables/useDesktopSession'
import { useBlockNonInputContextMenu } from '@owdproject/core/runtime/composables/useBlockNonInputContextMenu'
import { useDesktopWorkArea } from '@owdproject/core/runtime/composables/useDesktopWorkArea'
import Win95WindowSnapHints from './Win95WindowSnapHints.vue'
import Win95ConfirmDialogs from './Win95ConfirmDialogs.vue'
import DesktopBackground from './Background/DesktopBackground.vue'

const systemBar = useSystemBar()
const { shuttingDown } = useDesktopSession()

useBlockNonInputContextMenu()

const shellStageRef = ref<HTMLElement | null>(null)
useDesktopWorkArea(shellStageRef)
</script>

<template>
  <DesktopCore v-bind="$props">
    <DesktopBackground />

    <Win95WindowSnapHints />

    <div ref="shellStageRef" class="win95-shell__stage">
      <DesktopContent>
        <slot />
      </DesktopContent>

      <DesktopCoreApplicationRender />
    </div>

    <SystemBar
      v-if="systemBar?.enabled.value"
    />

    <DesktopShutdown
      :active="shuttingDown"
    />

    <Win95ConfirmDialogs />
  </DesktopCore>
</template>

<style lang="scss">
.win95-shell__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.owd-desktop {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: var(--owd-font-family), serif;
  font-size: var(--p-font-size);

  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  text-rendering: optimizeSpeed;

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
