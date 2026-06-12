<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useClassicCalculator } from '../../composables/useClassicCalculator'

defineProps<{
  window?: IWindowController
}>()

const { t } = useI18n()

const { displayText, ...calcActions } = useClassicCalculator(t('apps.calculator.error'))
</script>

<template>
  <Window :window="window" class="owd-window--calc">
    <div class="calc">
      <div
        class="calc__display"
        role="status"
        aria-live="polite"
        :aria-label="t('apps.calculator.display')"
      >
        {{ displayText }}
      </div>

      <div class="calc__keypad">
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.memoryClear')" @click="calcActions.memoryClear">MC</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.memoryRecall')" @click="calcActions.memoryRecall">MR</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.memoryStore')" @click="calcActions.memoryStore">MS</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.memoryAdd')" @click="calcActions.memoryAdd">M+</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.memorySubtract')" @click="calcActions.memorySubtract">M-</Button>

        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.backspace')" @click="calcActions.backspace">←</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.clearEntry')" @click="calcActions.clearEntry">CE</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.clear')" @click="calcActions.clearAll">C</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.negate')" @click="calcActions.toggleSign">±</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.sqrt')" @click="calcActions.squareRoot">√</Button>

        <Button type="button" class="calc-key" aria-label="7" @click="calcActions.inputDigit('7')">7</Button>
        <Button type="button" class="calc-key" aria-label="8" @click="calcActions.inputDigit('8')">8</Button>
        <Button type="button" class="calc-key" aria-label="9" @click="calcActions.inputDigit('9')">9</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.divide')" @click="calcActions.setOperator('/')">/</Button>
        <Button type="button" class="calc-key" aria-label="%" @click="calcActions.percent">%</Button>

        <Button type="button" class="calc-key" aria-label="4" @click="calcActions.inputDigit('4')">4</Button>
        <Button type="button" class="calc-key" aria-label="5" @click="calcActions.inputDigit('5')">5</Button>
        <Button type="button" class="calc-key" aria-label="6" @click="calcActions.inputDigit('6')">6</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.multiply')" @click="calcActions.setOperator('*')">*</Button>
        <Button type="button" class="calc-key" aria-label="1/x" @click="calcActions.reciprocal">1/x</Button>

        <Button type="button" class="calc-key" aria-label="1" @click="calcActions.inputDigit('1')">1</Button>
        <Button type="button" class="calc-key" aria-label="2" @click="calcActions.inputDigit('2')">2</Button>
        <Button type="button" class="calc-key" aria-label="3" @click="calcActions.inputDigit('3')">3</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.subtract')" @click="calcActions.setOperator('-')">-</Button>

        <Button type="button" class="calc-key calc-key--zero" aria-label="0" @click="calcActions.inputDigit('0')">0</Button>
        <Button type="button" class="calc-key" :aria-label="t('apps.calculator.key.decimal')" @click="calcActions.inputDecimal">.</Button>
        <Button type="button" class="calc-key calc-key--equals" :aria-label="t('apps.calculator.key.equals')" @click="calcActions.equals">=</Button>
        <Button type="button" class="calc-key calc-key--add" :aria-label="t('apps.calculator.key.add')" @click="calcActions.setOperator('+')">+</Button>
      </div>
    </div>
  </Window>
</template>

<style scoped lang="scss">
.calc {
  --calc-key-w: 50px;
  --calc-key-h: 34px;
  --calc-key-gap: 3px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 5px 5px;
  box-sizing: border-box;
}

.calc__display {
  flex-shrink: 0;
  width: calc(var(--calc-key-w) * 5 + var(--calc-key-gap) * 4);
  min-height: 34px;
  padding: 6px 8px;
  background: white;
  color: black;
  border: 2px solid;
  border-color: var(--p-input-border-color);
  box-shadow: var(--p-input-box-shadow);
  text-align: right;
  font-family: var(--owd-font-family);
  font-size: 1.15rem;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: none;
  box-sizing: border-box;
}

.calc__keypad {
  display: grid;
  grid-template-columns: repeat(5, var(--calc-key-w));
  grid-auto-rows: var(--calc-key-h);
  gap: var(--calc-key-gap);
}

.calc-key {
  width: var(--calc-key-w) !important;
  height: var(--calc-key-h) !important;
  min-width: var(--calc-key-w) !important;
  min-height: var(--calc-key-h) !important;
  padding: 0 !important;
  font-family: var(--owd-font-family);
  font-size: 1rem;
  line-height: 1;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(.p-button-label),
  :deep(> span) {
    white-space: nowrap;
    line-height: 1;
  }

  &--zero {
    grid-row: 6;
    grid-column: 1 / span 2;
    width: calc(var(--calc-key-w) * 2 + var(--calc-key-gap)) !important;
    min-width: calc(var(--calc-key-w) * 2 + var(--calc-key-gap)) !important;
  }

  &--add {
    grid-row: 5 / span 2;
    grid-column: 5;
    height: calc(var(--calc-key-h) * 2 + var(--calc-key-gap)) !important;
    min-height: calc(var(--calc-key-h) * 2 + var(--calc-key-gap)) !important;
  }

  &--equals {
    grid-row: 6;
    grid-column: 4;
    font-weight: bold;
  }
}
</style>

<style lang="scss">
.owd-window.owd-window--calc {
  min-width: 282px;

  > .p-card > .p-card-body {
    height: auto !important;

    > .p-card-content {
      height: auto !important;
    }
  }
}
</style>
