import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JsonArrayToCsv from '../renderer/src/components/tools/JsonArrayToCsv'

describe('JsonArrayToCsv', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title', () => {
    render(<JsonArrayToCsv />)
    expect(screen.getByText('JSON Array to CSV')).toBeInTheDocument()
  })

  it('converts valid JSON array to csv', () => {
    render(<JsonArrayToCsv />)
    const input = screen.getByPlaceholderText(/Paste your JSON array here/i)
    fireEvent.change(input, {
      target: { value: '[{"name":"John","age":30},{"name":"Jane","age":25}]' },
    })

    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/CSV output will appear here/i)
    expect((output as HTMLTextAreaElement).value).toContain('name,age')
    expect((output as HTMLTextAreaElement).value).toContain('John,30')
    expect((output as HTMLTextAreaElement).value).toContain('Jane,25')
  })

  it('shows error message for invalid json', () => {
    render(<JsonArrayToCsv />)
    const input = screen.getByPlaceholderText(/Paste your JSON array here/i)
    fireEvent.change(input, { target: { value: '{invalid json' } })

    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/CSV output will appear here/i)
    expect((output as HTMLTextAreaElement).value).toMatch(/Error converting JSON/i)
  })

  it('reset clears input and output', () => {
    render(<JsonArrayToCsv />)
    const input = screen.getByPlaceholderText(/Paste your JSON array here/i)
    fireEvent.change(input, {
      target: { value: '[{"name":"John"}]' },
    })

    fireEvent.click(screen.getByRole('button', { name: /convert/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    const output = screen.getByPlaceholderText(/CSV output will appear here/i)
    expect((input as HTMLTextAreaElement).value).toBe('')
    expect((output as HTMLTextAreaElement).value).toBe('')
  })
})
