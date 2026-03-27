import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HashChecksumGenerator from '../renderer/src/components/tools/HashChecksumGenerator'

describe('HashChecksumGenerator', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and input', () => {
    render(<HashChecksumGenerator />)
    expect(screen.getByText('Hash / Checksum Generator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter text to hash/i)).toBeInTheDocument()
  })

  it('shows error when computing hash without input', async () => {
    render(<HashChecksumGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    expect(await screen.findByText(/Please enter some text to hash/i)).toBeInTheDocument()
  })

  it('shows algorithm options', () => {
    render(<HashChecksumGenerator />)
    expect(screen.getByRole('button', { name: 'SHA-1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SHA-256' })).toBeInTheDocument()
  })
})
