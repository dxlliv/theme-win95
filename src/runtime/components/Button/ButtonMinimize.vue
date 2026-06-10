<template>
  <ButtonWindowNav>
    <div class="owd-button__icon" />
  </ButtonWindowNav>
</template>

<style scoped lang="scss">
.owd-button__icon {
  width: 11px;
  height: 14px;
  position: relative;
  flex-shrink: 0;

  &:before {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    height: 3px;
    background: rgb(var(--owd-theme-color-black));
    content: '';
  }
}
</style>
