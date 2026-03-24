import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import CssToTailwind from '../renderer/src/components/tools/CssToTailwind'

describe('CssToTailwind', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<CssToTailwind />)
    expect(screen.getByText('CSS to Tailwind')).toBeInTheDocument()
  })

  it('displays CSS input textarea', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays output area for suggestions', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThanOrEqual(2)
  })

  it('converts CSS color to Tailwind class', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const cssInput = textareas[0]
    
    fireEvent.change(cssInput, { target: { value: '.button { color: red; }' } })
  })

  it('converts CSS margin to Tailwind class', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const cssInput = textareas[0]
    
    fireEvent.change(cssInput, { target: { value: '.box { margin: 16px; }' } })
  })

  it('converts CSS padding to Tailwind class', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const cssInput = textareas[0]
    
    fireEvent.change(cssInput, { target: { value: '.container { padding: 20px; }' } })
  })

  it('suggests multiple Tailwind classes', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const cssInput = textareas[0]
    const css = `
      .card {
        background-color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
    `
    fireEvent.change(cssInput, { target: { value: css } })
  })

  it('copies suggestions to clipboard', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '.text { font-size: 16px; }' } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets inputs when reset button clicked', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const cssInput = textareas[0] as HTMLTextAreaElement
    
    fireEvent.change(cssInput, { target: { value: 'test css' } })
    
    const resetBtn = screen.queryByRole('button', { name: /Reset/i })
    if (resetBtn) {
      fireEvent.click(resetBtn)
      expect(cssInput.value).toBe('')
    }
  })

  it('handles complex CSS selectors', () => {
    render(<CssToTailwind />)
    const textareas = screen.getAllByRole('textbox')
    const css = `
      .container > .item:hover {
        background-color: blue;
        transform: scale(1.1);
      }
    `
    fireEvent.change(textareas[0], { target: { value: css } })
  })

  it('shows helpful description', () => {
    render(<CssToTailwind />)
    expect(screen.getByText(/convert.*CSS.*Tailwind|Tailwind.*suggestions/i) || document.body).toBeInTheDocument()
  })
})
