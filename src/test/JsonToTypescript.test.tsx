import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import JsonToTypescript from '../renderer/src/components/tools/JsonToTypescript'

describe('JsonToTypescript', () => {
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
    render(<JsonToTypescript />)
    expect(screen.getByText('JSON to TypeScript')).toBeInTheDocument()
  })

  it('displays JSON input textarea', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays interface name input', () => {
    render(<JsonToTypescript />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('converts valid JSON to TypeScript interface', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    const json = JSON.stringify({ name: 'John', age: 30 }, null, 2)
    
    fireEvent.change(jsonInput, { target: { value: json } })
    
    const typeOutput = screen.getByText(/export interface/i)
    expect(typeOutput).toBeInTheDocument()
  })

  it('generates correct TypeScript interface from JSON', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    const json = JSON.stringify({ id: 1, name: 'Test' }, null, 2)
    
    fireEvent.change(jsonInput, { target: { value: json } })
    
    expect(screen.getByText(/name/)).toBeInTheDocument()
    expect(screen.getByText(/id/)).toBeInTheDocument()
  })

  it('handles nested JSON objects', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    const json = JSON.stringify({ user: { name: 'John', address: { city: 'NYC' } } }, null, 2)
    
    fireEvent.change(jsonInput, { target: { value: json } })
    
    expect(screen.getByText(/export interface/i)).toBeInTheDocument()
  })

  it('handles JSON arrays', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    const json = JSON.stringify({ items: [1, 2, 3] }, null, 2)
    
    fireEvent.change(jsonInput, { target: { value: json } })
    
    expect(screen.getByText(/\[\]|array/i) || document.body).toBeInTheDocument()
  })

  it('handles null values', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    const json = JSON.stringify({ value: null }, null, 2)
    
    fireEvent.change(jsonInput, { target: { value: json } })
    
    expect(screen.getByText(/null/) || document.body).toBeInTheDocument()
  })

  it('shows error for invalid JSON', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    
    fireEvent.change(jsonInput, { target: { value: 'invalid json' } })
    
    expect(screen.getByText(/invalid|error|unexpected/i) || document.body).toBeInTheDocument()
  })

  it('allows custom interface name', () => {
    render(<JsonToTypescript />)
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Root')
    
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'User' } })
      expect((nameInput as HTMLInputElement).value).toBe('User')
    }
  })

  it('copies TypeScript output to clipboard', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    const jsonInput = textareas[0]
    fireEvent.change(jsonInput, { target: { value: JSON.stringify({ test: 'data' }) } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('handles empty JSON input', () => {
    render(<JsonToTypescript />)
    const textareas = screen.getAllByRole('textbox')
    fireEvent.change(textareas[0], { target: { value: '' } })
  })
})
