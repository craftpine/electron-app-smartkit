import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import UuidGenerator from '../renderer/src/components/tools/UuidGenerator'

describe('UuidGenerator', () => {
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
    render(<UuidGenerator />)
    expect(screen.getByText('UUID Generator')).toBeInTheDocument()
  })

  it('shows all version buttons', () => {
    render(<UuidGenerator />)
    expect(screen.getByRole('button', { name: /v4 \(Random\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /v1 \(Timestamp\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nil/i })).toBeInTheDocument()
  })

  it('defaults to v4 version with quantity 1', () => {
    render(<UuidGenerator />)
    expect(screen.getByRole('spinbutton')).toHaveValue(1)
    const v4Btn = screen.getByRole('button', { name: /v4 \(Random\)/i })
    expect(v4Btn.className).toMatch(/bg-blue-600/)
  })

  it('shows features section before generating', () => {
    render(<UuidGenerator />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText(/UUID v4 \(cryptographically random\)/i)).toBeInTheDocument()
  })

  it('hides features section and shows output after generating', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(screen.getByText(/Generated UUID/)).toBeInTheDocument()
  })

  it('generates a v4 UUID with hyphens by default', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const uuidText = screen.getByText(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(uuidText).toBeInTheDocument()
  })

  it('generates multiple UUIDs with correct count', () => {
    render(<UuidGenerator />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText(/Generated UUIDs \(5\)/)).toBeInTheDocument()
    const uuids = screen.getAllByText(/^[0-9a-f\-]{36}$/i)
    expect(uuids.length).toBeGreaterThanOrEqual(5)
  })

  it('switches to v1 version and generates timestamp-based UUID', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /v1 \(Timestamp\)/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const v1Btn = screen.getByRole('button', { name: /v1 \(Timestamp\)/i })
    expect(v1Btn.className).toMatch(/bg-blue-600/)
    // v1 UUIDs have version 1 in the 7th position
    const uuidText = screen.getByText(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(uuidText).toBeInTheDocument()
  })

  it('switches to nil version and generates nil UUID', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /^Nil$/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const nilBtn = screen.getByRole('button', { name: /^Nil$/i })
    expect(nilBtn.className).toMatch(/bg-blue-600/)
    expect(screen.getByText('00000000-0000-0000-0000-000000000000')).toBeInTheDocument()
  })

  it('applies uppercase formatting when checked', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Uppercase/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const uuidText = screen.getByText(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    expect(uuidText).toBeInTheDocument()
  })

  it('removes hyphens when unchecked', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Hyphens/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const uuidText = screen.getByText(/^[0-9a-f]{32}$/i)
    expect(uuidText).toBeInTheDocument()
  })

  it('applies both uppercase and removes hyphens', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Uppercase/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Hyphens/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const uuidText = screen.getByText(/^[0-9A-F]{32}$/i)
    expect(uuidText).toBeInTheDocument()
  })

  it('clamps quantity to 1 when set to 0', () => {
    render(<UuidGenerator />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText(/Generated UUID \(1\)/)).toBeInTheDocument()
  })

  it('clamps quantity to 500 max', () => {
    render(<UuidGenerator />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '999' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText(/Generated UUIDs \(500\)/)).toBeInTheDocument()
  })

  it('copies all UUIDs to clipboard', () => {
    render(<UuidGenerator />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy all/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('\n')
    )
  })

  it('shows "Copied!" after copying all and reverts after 2 seconds', async () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy all/i }))
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button', { name: /copy all/i })).toBeInTheDocument()
  })

  it('copies single UUID when hovering and clicking individual copy button', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const copyButtons = screen.getAllByTitle('Copy')
    fireEvent.click(copyButtons[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/^[0-9a-f\-]{36}$/i)
    )
  })

  it('does not show output section before generating', () => {
    render(<UuidGenerator />)
    expect(screen.queryByText(/Generated UUID/)).not.toBeInTheDocument()
  })

  it('resets all fields when reset button is clicked', () => {
    render(<UuidGenerator />)
    // Change state
    fireEvent.click(screen.getByRole('button', { name: /v1 \(Timestamp\)/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /Uppercase/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Hyphens/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    // Output is visible — now reset
    fireEvent.click(screen.getByRole('button', { name: '' })) // reset icon button

    // After reset: back to defaults
    expect(screen.getByRole('spinbutton')).toHaveValue(1)
    const v4Btn = screen.getByRole('button', { name: /v4 \(Random\)/i })
    expect(v4Btn.className).toMatch(/bg-blue-600/)
    expect(screen.getByRole('checkbox', { name: /Uppercase/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Hyphens/i })).toBeChecked()
    expect(screen.queryByText(/Generated UUID/)).not.toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('formats UUID correctly with all options applied', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /v4 \(Random\)/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Uppercase/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Hyphens/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    // Should have 2 UUIDs without hyphens and all uppercase
    const uuidText = screen.getAllByText(/^[0-9A-F]{32}$/i)
    expect(uuidText.length).toBeGreaterThanOrEqual(2)
  })

  it('displays singular/plural "UUID" label correctly', () => {
    render(<UuidGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText(/Generated UUID \(/)).toBeInTheDocument()

    // Now generate multiple
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText(/Generated UUIDs \(/)).toBeInTheDocument()
  })

  it('preserves UUID list when copy is clicked', () => {
    render(<UuidGenerator />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const uuidBefore = screen.getAllByText(/^[0-9a-f\-]{36}$/i)
    const count = uuidBefore.length

    fireEvent.click(screen.getByRole('button', { name: /copy all/i }))
    const uuidAfter = screen.getAllByText(/^[0-9a-f\-]{36}$/i)
    expect(uuidAfter.length).toBe(count)
  })
})
