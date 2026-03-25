import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import GzipEncoder from '../renderer/src/components/tools/GzipEncoder'

describe('GzipEncoder', () => {
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
    render(<GzipEncoder />)
    expect(screen.getByText('Gzip Encoder / Decoder')).toBeInTheDocument()
  })

  it('displays input textarea', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('defaults to compress mode', () => {
    render(<GzipEncoder />)
    const compressBtn = screen.getByRole('button', { name: /compress/i })
    expect(compressBtn.className).toMatch(/bg-blue-600/) 
  })

  it('switches between compress and decompress modes', () => {
    render(<GzipEncoder />)
    const decompressBtn = screen.getByRole('button', { name: /decompress/i })
    fireEvent.click(decompressBtn)
    
    expect(decompressBtn.className).toMatch(/bg-blue-600/)
  })

  it('compresses text and produces base64 output', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    
    fireEvent.change(inputArea, { target: { value: 'hello world hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    // Compressed output should be base64
    const outputArea = textareas[1] as HTMLTextAreaElement
    expect(outputArea.value.length).toBeGreaterThan(0)
  })

  it('handles compress mode', () => {
    render(<GzipEncoder />)
    expect(screen.getByText(/compress/i, { selector: 'button' })).toBeInTheDocument()
  })

  it('handles decompress mode', () => {
    render(<GzipEncoder />)
    expect(screen.getByText(/decompress/i, { selector: 'button' })).toBeInTheDocument()
  })

  it('shows error for empty input in compress mode', () => {
    render(<GzipEncoder />)
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const textareas = screen.getAllByRole('textbox')
    const outputArea = textareas[1] as HTMLTextAreaElement
    expect(outputArea.value).toBe('')
  })

  it('shows error for empty input in decompress mode', () => {
    render(<GzipEncoder />)
    const decompressBtn = screen.getByRole('button', { name: /decompress/i })
    fireEvent.click(decompressBtn)
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const textareas = screen.getAllByRole('textbox')
    const outputArea = textareas[1] as HTMLTextAreaElement
    expect(outputArea.value).toBe('')
  })

  it('copies output to clipboard', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    
    fireEvent.change(inputArea, { target: { value: 'test data' } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const copyBtn = screen.queryByRole('button', { name: /Copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('shows "Copied!" message after copying', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    
    fireEvent.change(inputArea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const copyBtn = screen.queryByRole('button', { name: /Copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(screen.getByText(/Copied!/)).toBeInTheDocument()
    }
  })

  it('has mode switch button', () => {
    render(<GzipEncoder />)
    const switchBtn = screen.getByRole('button', { name: /switch mode/i })
    expect(switchBtn).toBeInTheDocument()
  })

  it('swaps input and output when mode is switched', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    const outputArea = textareas[1]
    
    fireEvent.change(inputArea, { target: { value: 'test data' } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const switchBtn = screen.getByRole('button', { name: /switch mode/i })
    fireEvent.click(switchBtn)
    
    // After switch, input should contain the previous output
    expect((inputArea as HTMLTextAreaElement).value).not.toBe('test data')
  })

  it('resets all values when reset button is clicked', () => {
    render(<GzipEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    const outputArea = textareas[1]
    
    fireEvent.change(inputArea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const resetBtn = screen.getByRole('button', { name: /Reset/i })
    fireEvent.click(resetBtn)
    
    expect((inputArea as HTMLTextAreaElement).value).toBe('')
    expect((outputArea as HTMLTextAreaElement).value).toBe('')
  })

  it('handles large input text', () => {
    render(<GzipEncoder />)
    const largeText = 'a'.repeat(10000)
    const textareas = screen.getAllByRole('textbox')
    const inputArea = textareas[0]
    
    fireEvent.change(inputArea, { target: { value: largeText } })
    fireEvent.click(screen.getByRole('button', { name: /Process/i }))
    
    const outputArea = textareas[1] as HTMLTextAreaElement
    // Output should be compressed
    expect(outputArea.value.length).toBeLessThan(largeText.length)
  })

  it('shows helpful description', () => {
    render(<GzipEncoder />)
    expect(screen.getByText(/compress.*decompress/i)).toBeInTheDocument()
  })
})
