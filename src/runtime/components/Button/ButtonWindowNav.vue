<script setup lang="ts">
defineProps<{
  title?: string
  disabled?: boolean
}>()
</script>

<template>
  <DesktopWindowNavButton :title="title" :disabled="disabled">
    <slot />
  </DesktopWindowNavButton>
</template>
