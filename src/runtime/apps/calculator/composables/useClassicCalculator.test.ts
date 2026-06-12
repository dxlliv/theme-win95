import { describe, expect, it } from 'vitest'
import { useClassicCalculator } from './useClassicCalculator'

function press(calc: ReturnType<typeof useClassicCalculator>, ...keys: string[]) {
  for (const key of keys) {
    switch (key) {
      case 'C':
        calc.clearAll()
        break
      case 'CE':
        calc.clearEntry()
        break
      case '=':
        calc.equals()
        break
      case '+':
      case '-':
      case '*':
      case '/':
        calc.setOperator(key)
        break
      case '.':
        calc.inputDecimal()
        break
      case 'MC':
        calc.memoryClear()
        break
      case 'MR':
        calc.memoryRecall()
        break
      case 'MS':
        calc.memoryStore()
        break
      default:
        if (key.length === 1) calc.inputDigit(key)
    }
  }
}

describe('useClassicCalculator', () => {
  it('adds two numbers', () => {
    const calc = useClassicCalculator()
    press(calc, '2', '+', '2', '=')
    expect(calc.displayText.value).toBe('4')
  })

  it('clears entry vs all', () => {
    const calc = useClassicCalculator()
    press(calc, '9', 'CE')
    expect(calc.displayText.value).toBe('0')
    press(calc, 'C', '5', '+', '2', 'C')
    expect(calc.displayText.value).toBe('0')
  })

  it('stores and recalls memory', () => {
    const calc = useClassicCalculator()
    press(calc, '7', 'MS', 'C', 'MR')
    expect(calc.displayText.value).toBe('7')
  })

  it('shows error on divide by zero', () => {
    const calc = useClassicCalculator('Error')
    press(calc, '1', '/', '0', '=')
    expect(calc.displayText.value).toBe('Error')
  })

  it('computes square root', () => {
    const calc = useClassicCalculator()
    press(calc, '9')
    calc.squareRoot()
    expect(calc.displayText.value).toBe('3')
  })
})
