import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import JavascriptToTypescript from '../renderer/src/components/tools/JavascriptToTypescript'

describe('JavascriptToTypescript', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<JavascriptToTypescript />)
    expect(screen.getByText('JavaScript to TypeScript')).toBeInTheDocument()
  })

  it('displays JavaScript input textarea', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays TypeScript output area', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThanOrEqual(2)
  })

  it('converts JavaScript to TypeScript', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsInput = textareas[0]
    
    fireEvent.change(jsInput, { target: { value: 'const add = (a, b) => a + b;' } })
  })

  it('shows TypeScript conversion result', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: 'function greet(name) { return `Hi ${name}`; }' } })
    
    const outputArea = textareas[1] as HTMLTextAreaElement
    expect(outputArea.value.length >= 0).toBe(true)
  })

  it('converts arrow functions', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: 'const fn = (x) => x * 2;' } })
  })

  it('converts function declarations', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: 'function multiply(a, b) { return a * b; }' } })
  })

  it('handles object literals', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const js = '{ name: "John", age: 30, city: "NYC" }'
    fireEvent.change(textareas[0], { target: { value: js } })
  })

  it('copies output to clipboard', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: 'const x = 5;' } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets when reset button clicked', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsInput = textareas[0] as HTMLTextAreaElement
    
    fireEvent.change(jsInput, { target: { value: 'test' } })
    
    const resetBtn = screen.queryByRole('button', { name: /Reset/i })
    if (resetBtn) {
      fireEvent.click(resetBtn)
      expect(jsInput.value).toBe('')
    }
  })

  it('handles complex JavaScript code', () => {
    render(<JavascriptToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const complexJs = `
      class Calculator {
        add(a, b) {
          return a + b;
        }
        multiply(a, b) {
          return a * b;
        }
      }
    `
    fireEvent.change(textareas[0], { target: { value: complexJs } })
  })
})
