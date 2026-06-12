<script setup lang="ts">
import { inject } from 'vue'
import { useToggleWindowMaximize } from '@owdproject/core/runtime/composables/useToggleWindowMaximize'

const windowController = inject<IWindowController>('windowController')
const toggleWindowMaximize = useToggleWindowMaximize()

function onWindowMinimize() {
  if (!windowController?.instanced) return

  windowController.actions.minimize()
}

function onWindowMaximize() {
  if (!windowController?.isMaximizable) return

  toggleWindowMaximize(windowController)
}

function onWindowNavDestroy() {
  if (!windowController?.instanced) return

  windowController.actions.destroy()
}
</script>

<template>
  <DesktopWindowNav @dblclick="onWindowMaximize">
    <WindowNavIcon
      v-if="windowController?.icon"
      :icon="windowController.icon"
    />

    <div v-if="windowController?.title" class="owd-window-nav__title">
      <div
        class="owd-window-nav__title-inner truncate"
        v-text="windowController?.title"
      />
    </div>

    <div class="owd-window-nav__btn-group owd-window-nav__btn-group--append">
      <slot name="append" />

      <ButtonMinimize
        v-if="!windowController?.instanced || windowController?.isMinimizable"
        @mousedown.stop
        @click.stop="onWindowMinimize"
      />
      <ButtonMaximize
        :disabled="!windowController?.isMaximizable"
        :is-maximized="windowController?.isMaximized"
        @mousedown.stop
        @click.stop="onWindowMaximize"
      />
      <ButtonClose
        v-if="!windowController?.instanced || windowController?.isDestroyable"
        @mousedown.stop
        @click.stop="onWindowNavDestroy"
      />
    </div>
  </DesktopWindowNav>
</template>

<style scoped lang="scss">
.owd-window-nav {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  justify-content: space-between;
  height: var(--owd-windov-nav-height);
  font-size: var(--p-font-size);
  line-height: 1rem;
  font-weight: bold;
  background: rgb(var(--owd-elevation-inactive));
  color: rgb(var(--owd-theme-color-light));

  &--focused {
    background: rgb(var(--owd-elevation-active-background));
    color: rgb(var(--owd-elevation-active-color));
  }

  &__btn-group {
    display: flex;
    gap: var(--owd-gap);
    padding: var(--owd-gap);
    margin-right: -1px;
  }

  &__title {
    display: flex;
    align-items: center;
    padding-left: 6px;
    gap: var(--owd-gap);
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
