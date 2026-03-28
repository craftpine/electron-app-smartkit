import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JsonToTypescript from '../renderer/src/components/tools/JsonToTypescript'

describe('JsonToTypescript', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title', () => {
    render(<JsonToTypescript />)
    expect(screen.getByText('JSON to TypeScript')).toBeInTheDocument()
  })

  it('converts valid json to interface', () => {
    render(<JsonToTypescript />)
    const input = screen.getByPlaceholderText(/Paste your JSON here/i)
    fireEvent.change(input, { target: { value: '{"name":"John","age":30}' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/TypeScript interfaces will appear here/i)
    expect((output as HTMLTextAreaElement).value).toContain('export interface')
    expect((output as HTMLTextAreaElement).value).toContain('name: string')
  })

  it('shows error message text for invalid json', () => {
    render(<JsonToTypescript />)
    const input = screen.getByPlaceholderText(/Paste your JSON here/i)
    fireEvent.change(input, { target: { value: '{invalid json' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/TypeScript interfaces will appear here/i)
    expect((output as HTMLTextAreaElement).value).toMatch(/Error converting JSON/i)
  })
})
