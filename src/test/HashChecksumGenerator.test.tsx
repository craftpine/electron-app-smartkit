import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import HashChecksumGenerator from '../renderer/src/components/tools/HashChecksumGenerator'

describe('HashChecksumGenerator', () => {
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
    render(<HashChecksumGenerator />)
    expect(screen.getByText('Hash / Checksum Generator')).toBeInTheDocument()
  })

  it('displays all algorithm buttons', () => {
    render(<HashChecksumGenerator />)
    expect(screen.getByRole('button', { name: 'SHA-1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SHA-256' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SHA-384' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SHA-512' })).toBeInTheDocument()
  })

  it('defaults to SHA-256 algorithm', () => {
    render(<HashChecksumGenerator />)
    const sha256Btn = screen.getByRole('button', { name: 'SHA-256' })
    expect(sha256Btn.className).toMatch(/bg-blue-600/)
  })

  it('shows supported algorithms in features block before computing', () => {
    render(<HashChecksumGenerator />)
    expect(screen.getByText('Supported Algorithms')).toBeInTheDocument()
    expect(screen.getByText(/160-bit/)).toBeInTheDocument()
  })

  it('shows error when computing hash without input', async () => {
    render(<HashChecksumGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Please enter some text to hash.')).toBeInTheDocument()
    })
  })

  it('computes SHA-256 hash successfully', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/SHA-256 Hash/)).toBeInTheDocument()
    })
  })

  it('displays hash output in lowercase by default', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      const hashOutput = screen.getByText(/SHA-256 Hash/).closest('.bg-white')?.querySelector('.font-mono')?.textContent
      expect(hashOutput).toMatch(/^[a-f0-9]+$/)
    })
  })

  it('converts hash to uppercase when checkbox is checked', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    
    const uppercaseCheckbox = screen.getByRole('checkbox', { name: /Uppercase output/i })
    fireEvent.click(uppercaseCheckbox)
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      const hashOutput = screen.getByText(/SHA-256 Hash/).closest('.bg-white')?.querySelector('.font-mono')?.textContent
      expect(hashOutput).toMatch(/^[A-F0-9]+$/)
    })
  })

  it('switches between algorithms', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    
    // Compute with SHA-256
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    await waitFor(() => {
      expect(screen.getByText(/SHA-256 Hash/)).toBeInTheDocument()
    })
    
    // Switch to SHA-512
    fireEvent.click(screen.getByRole('button', { name: 'SHA-512' }))
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/SHA-512 Hash/)).toBeInTheDocument()
    })
  })

  it('displays hash length and bits information', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/bytes/)).toBeInTheDocument()
      expect(screen.getByText(/bits/)).toBeInTheDocument()
    })
  })

  it('hides features section after computing hash', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Supported Algorithms')).not.toBeInTheDocument()
    })
  })

  it('copies hash to clipboard', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      const copyBtn = screen.getByRole('button', { name: /Copy/ })
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('shows "Copied!" message after copying', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      const copyBtn = screen.getByRole('button', { name: /Copy/ })
      fireEvent.click(copyBtn)
      expect(screen.getByText(/Copied!/)).toBeInTheDocument()
    })
  })

  it('resets all values when reset button is clicked', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/SHA-256 Hash/)).toBeInTheDocument()
    })
    
    const resetBtn = screen.getByRole('button', { name: /Reset/ })
    fireEvent.click(resetBtn)
    
    expect(textarea.value).toBe('')
    expect(screen.queryByText(/SHA-256 Hash/)).not.toBeInTheDocument()
    expect(screen.getByText('Supported Algorithms')).toBeInTheDocument()
  })

  it('clears error message when new input is provided', async () => {
    render(<HashChecksumGenerator />)
    
    // Trigger error by trying to hash empty input
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    await waitFor(() => {
      expect(screen.getByText('Please enter some text to hash.')).toBeInTheDocument()
    })
    
    // Enter text and hash again
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter some text to hash.')).not.toBeInTheDocument()
      expect(screen.getByText(/SHA-256 Hash/)).toBeInTheDocument()
    })
  })

  it('handles different hash algorithms with same input', async () => {
    render(<HashChecksumGenerator />)
    const textarea = screen.getByPlaceholderText('Enter text to hash...')
    fireEvent.change(textarea, { target: { value: 'same input' } })
    
    // Get SHA-1 hash
    fireEvent.click(screen.getByRole('button', { name: 'SHA-1' }))
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/SHA-1 Hash/)).toBeInTheDocument()
    })
    
    const sha1Element = screen.getByText(/SHA-1 Hash/).closest('.bg-white')?.querySelector('.font-mono')?.textContent
    
    // Switch to SHA-256
    fireEvent.click(screen.getByRole('button', { name: 'SHA-256' }))
    fireEvent.click(screen.getByRole('button', { name: /Compute Hash/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/SHA-256 Hash/)).toBeInTheDocument()
    })
    
    const sha256Element = screen.getByText(/SHA-256 Hash/).closest('.bg-white')?.querySelector('.font-mono')?.textContent
    expect(sha1Element).not.toEqual(sha256Element)
  })

  it('shows uppercase checkbox', () => {
    render(<HashChecksumGenerator />)
    expect(screen.getByRole('checkbox', { name: /Uppercase output/i })).toBeInTheDocument()
  })
})
