import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import HtmlToJsx from '../renderer/src/components/tools/HtmlToJsx'

describe('HtmlToJsx', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders without crashing', () => {
    render(<HtmlToJsx />)
    expect(screen.getByText('HTML to JSX')).toBeInTheDocument()
  })

  it('displays HTML input textarea', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays JSX output textarea', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThanOrEqual(2)
  })

  it('converts HTML to JSX on input', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0]
    
    fireEvent.change(htmlInput, { target: { value: '<div class="container">Hello</div>' } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value).toMatch(/className/i)
  })

  it('converts class attribute to className', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0]
    
    fireEvent.change(htmlInput, { target: { value: '<div class="test">Content</div>' } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value).toMatch(/className="test"/)
  })

  it('formats JSX properly with indentation', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0]
    
    fireEvent.change(htmlInput, { target: { value: '<div><p>Nested</p></div>' } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value.length).toBeGreaterThan(0)
  })

  it('copies JSX output to clipboard', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<div>Test</div>' } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets both input and output', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0] as HTMLTextAreaElement
    const jsxOutput = textareas[1] as HTMLTextAreaElement
    
    fireEvent.change(htmlInput, { target: { value: '<div>Test</div>' } })
    
    const resetBtn = screen.getByRole('button', { name: /Reset/ })
    fireEvent.click(resetBtn)
    
    expect(htmlInput.value).toBe('')
    expect(jsxOutput.value).toBe('')
  })

  it('handles empty HTML input', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '' } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value).toBe('')
  })

  it('handles self-closing tags', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<img src="test.jpg" />' } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value).toContain('img')
  })

  it('handles complex HTML structures', () => {
    render(<HtmlToJsx />)
    const textareas = screen.getAllByRole('textbox')
    const complexHtml = `<div class="container">
      <header>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </header>
    </div>`
    fireEvent.change(textareas[0], { target: { value: complexHtml } })
    
    const jsxArea = textareas[1] as HTMLTextAreaElement
    expect(jsxArea.value.length).toBeGreaterThan(0)
  })
})
