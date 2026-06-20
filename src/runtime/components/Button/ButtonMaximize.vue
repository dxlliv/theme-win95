<template>
  <DesktopWindowNavButton :disabled="disabled">
    <svg
      v-if="isMaximized"
      class="owd-button__icon owd-button__icon--restore"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
      style="overflow: visible;"
    >
      <g v-if="disabled">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H2V2H0V8H6V6H8V0ZM7 2H3V5H5V6H2V3H6V2H7V1H4V2H6H7V2Z" fill="white" transform="translate(1, 1)"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H2V2H0V8H6V6H8V0ZM7 2H3V5H5V6H2V3H6V2H7V1H4V2H6H7V2Z" fill="rgb(var(--owd-theme-color-dark))"/>
      </g>
      <path v-else fill-rule="evenodd" clip-rule="evenodd" d="M8 0H2V2H0V8H6V6H8V0ZM7 2H3V5H5V6H2V3H6V2H7V1H4V2H6H7V2Z" fill="black"/>
    </svg>
    <svg
      v-else
      class="owd-button__icon"
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
      style="overflow: visible;"
    >
      <g v-if="disabled">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM8 2H1V8H8V2Z" fill="white" transform="translate(1, 1)"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM8 2H1V8H8V2Z" fill="rgb(var(--owd-theme-color-dark))"/>
      </g>
      <path v-else fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM8 2H1V8H8V2Z" fill="black"/>
    </svg>
  </DesktopWindowNavButton>
</template>

<script setup lang="ts">
defineProps<{
  isMaximized?: boolean
  disabled?: boolean
}>()
</script>

<style scoped lang="scss">
.owd-button__icon {
  flex-shrink: 0;
}
</style>
