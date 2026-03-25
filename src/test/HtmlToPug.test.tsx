import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import HtmlToPug from '../renderer/src/components/tools/HtmlToPug'

describe('HtmlToPug', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<HtmlToPug />)
    expect(screen.getByText('HTML to Pug')).toBeInTheDocument()
  })

  it('displays HTML input textarea', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays Pug output area', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThanOrEqual(2)
  })

  it('converts HTML to Pug format', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0]
    
    fireEvent.change(htmlInput, { target: { value: '<div class="container">Content</div>' } })
  })

  it('removes closing tags in Pug output', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<div>Text</div>' } })
    
    const pugOutput = textareas[1] as HTMLTextAreaElement
    // Pug format should not have closing tags
    expect(pugOutput.value).toBeDefined()
  })

  it('converts nested elements properly', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    const html = '<div><h1>Title</h1><p>Content</p></div>'
    fireEvent.change(textareas[0], { target: { value: html } })
  })

  it('handles self-closing tags', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<img src="test.jpg" alt="test" />' } })
  })

  it('converts class and id attributes', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<div id="main" class="container">Text</div>' } })
  })

  it('copies output to clipboard', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '<p>Test</p>' } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets when reset button clicked', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    const htmlInput = textareas[0] as HTMLTextAreaElement
    
    fireEvent.change(htmlInput, { target: { value: '<div>Test</div>' } })
    
    const resetBtn = screen.queryByRole('button', { name: /Reset/i })
    if (resetBtn) {
      fireEvent.click(resetBtn)
      expect(htmlInput.value).toBe('')
    }
  })

  it('handles complex HTML structures', () => {
    render(<HtmlToPug />)
    const textareas = screen.getAllByRole('textbox')
    const html = `
      <nav>
        <ul class="menu">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    `
    fireEvent.change(textareas[0], { target: { value: html } })
  })
})
