import { ref, computed } from 'vue'

type Operator = '+' | '-' | '*' | '/'

const MAX_DISPLAY_LENGTH = 16

function formatDisplayValue(value: number): string {
  if (!Number.isFinite(value)) return 'Error'

  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e16 || abs < 1e-7)) {
    return value.toExponential(10).replace(/\.?0+e/, 'e')
  }

  let text = String(value)
  if (text.includes('e')) return text

  if (text.includes('.')) {
    text = text.replace(/\.?0+$/, '')
  }

  if (text.length > MAX_DISPLAY_LENGTH) {
    return value.toPrecision(MAX_DISPLAY_LENGTH)
  }

  return text
}

function parseDisplay(text: string): number {
  const value = Number.parseFloat(text)
  return Number.isFinite(value) ? value : 0
}

export function useClassicCalculator(errorLabel = 'Error') {
  const display = ref('0')
  const accumulator = ref<number | null>(null)
  const pendingOp = ref<Operator | null>(null)
  const freshOperand = ref(true)
  const memory = ref(0)
  const hasMemory = ref(false)
  const inError = ref(false)

  const displayText = computed(() =>
    inError.value ? errorLabel : display.value,
  )

  function setError() {
    inError.value = true
    display.value = errorLabel
    accumulator.value = null
    pendingOp.value = null
    freshOperand.value = true
  }

  function guard(): boolean {
    return !inError.value
  }

  function setDisplayFromNumber(value: number) {
    if (!Number.isFinite(value)) {
      setError()
      return
    }
    display.value = formatDisplayValue(value)
    freshOperand.value = true
  }

  function applyPendingOp(): boolean {
    if (pendingOp.value === null || accumulator.value === null) return true

    const left = accumulator.value
    const right = parseDisplay(display.value)
    let result: number

    switch (pendingOp.value) {
      case '+':
        result = left + right
        break
      case '-':
        result = left - right
        break
      case '*':
        result = left * right
        break
      case '/':
        if (right === 0) {
          setError()
          return false
        }
        result = left / right
        break
    }

    setDisplayFromNumber(result)
    accumulator.value = result
    return true
  }

  function inputDigit(digit: string) {
    if (!guard()) return

    if (freshOperand.value) {
      display.value = digit === '0' ? '0' : digit
      freshOperand.value = false
      return
    }

    if (display.value === '0' && digit !== '.') {
      display.value = digit
      return
    }

    if (display.value.length >= MAX_DISPLAY_LENGTH) return

    display.value += digit
  }

  function inputDecimal() {
    if (!guard()) return

    if (freshOperand.value) {
      display.value = '0.'
      freshOperand.value = false
      return
    }

    if (display.value.includes('.')) return
    if (display.value.length >= MAX_DISPLAY_LENGTH) return

    display.value += '.'
  }

  function clearAll() {
    inError.value = false
    display.value = '0'
    accumulator.value = null
    pendingOp.value = null
    freshOperand.value = true
  }

  function clearEntry() {
    if (!guard()) return
    display.value = '0'
    freshOperand.value = true
  }

  function backspace() {
    if (!guard() || freshOperand.value) return

    if (display.value.length <= 1 || (display.value.length === 2 && display.value.startsWith('-'))) {
      display.value = '0'
      freshOperand.value = true
      return
    }

    display.value = display.value.slice(0, -1)
  }

  function toggleSign() {
    if (!guard()) return

    const value = parseDisplay(display.value)
    setDisplayFromNumber(-value)
    freshOperand.value = false
  }

  function squareRoot() {
    if (!guard()) return

    const value = parseDisplay(display.value)
    if (value < 0) {
      setError()
      return
    }

    setDisplayFromNumber(Math.sqrt(value))
  }

  function percent() {
    if (!guard()) return

    const current = parseDisplay(display.value)

    if (pendingOp.value === '+' || pendingOp.value === '-') {
      if (accumulator.value === null) {
        setDisplayFromNumber(current / 100)
        return
      }
      setDisplayFromNumber((accumulator.value * current) / 100)
      freshOperand.value = true
      return
    }

    setDisplayFromNumber(current / 100)
  }

  function reciprocal() {
    if (!guard()) return

    const value = parseDisplay(display.value)
    if (value === 0) {
      setError()
      return
    }

    setDisplayFromNumber(1 / value)
  }

  function setOperator(op: Operator) {
    if (!guard()) return

    const current = parseDisplay(display.value)

    if (pendingOp.value !== null && accumulator.value !== null && !freshOperand.value) {
      if (!applyPendingOp()) return
    } else if (accumulator.value === null) {
      accumulator.value = current
    } else if (freshOperand.value) {
      // chained ops: keep accumulator, swap operator only
    } else {
      accumulator.value = current
    }

    pendingOp.value = op
    freshOperand.value = true
  }

  function equals() {
    if (!guard()) return

    if (pendingOp.value === null || accumulator.value === null) return

    applyPendingOp()
    pendingOp.value = null
    accumulator.value = null
  }

  function memoryClear() {
    memory.value = 0
    hasMemory.value = false
  }

  function memoryRecall() {
    if (!guard()) return
    setDisplayFromNumber(memory.value)
    freshOperand.value = true
  }

  function memoryStore() {
    if (!guard()) return
    memory.value = parseDisplay(display.value)
    hasMemory.value = true
  }

  function memoryAdd() {
    if (!guard()) return
    memory.value += parseDisplay(display.value)
    hasMemory.value = true
    freshOperand.value = true
  }

  function memorySubtract() {
    if (!guard()) return
    memory.value -= parseDisplay(display.value)
    hasMemory.value = true
    freshOperand.value = true
  }

  return {
    displayText,
    hasMemory,
    inputDigit,
    inputDecimal,
    clearAll,
    clearEntry,
    backspace,
    toggleSign,
    squareRoot,
    percent,
    reciprocal,
    setOperator,
    equals,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
  }
}
