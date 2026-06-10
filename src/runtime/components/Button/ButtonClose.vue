<template>
  <ButtonWindowNav>
    <div class="owd-button__icon owd-button__icon--close" />
  </ButtonWindowNav>
</template>

<style scoped lang="scss">
.owd-button__icon {
  width: 12px;
  height: 12px;
  position: relative;
  flex-shrink: 0;
  transform: rotate(45deg);

  &:before,
  &:after {
    position: absolute;
    background: rgb(var(--owd-theme-color-black));
    content: '';
  }

  &:before {
    height: 100%;
    width: 2px;
    left: 50%;
    transform: translateX(-50%);
  }

  &:after {
    height: 2px;
    width: 100%;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
