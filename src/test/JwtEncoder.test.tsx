import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import JwtEncoder from '../renderer/src/components/tools/JwtEncoder'

describe('JwtEncoder', () => {
  it('renders title and form controls', () => {
    render(<JwtEncoder />)
    expect(screen.getByText('JWT Encoder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your JWT payload as JSON/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your secret key/i)).toBeInTheDocument()
  })

  it('shows payload required error', async () => {
    render(<JwtEncoder />)
    const payload = screen.getByPlaceholderText(/Enter your JWT payload as JSON/i)
    fireEvent.change(payload, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Generate JWT/i }))

    expect(await screen.findByText(/Please enter a payload/i)).toBeInTheDocument()
  })

  it('shows secret required error', async () => {
    render(<JwtEncoder />)
    fireEvent.change(screen.getByPlaceholderText(/Enter your secret key/i), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Generate JWT/i }))

    expect(await screen.findByText(/Please enter a secret key/i)).toBeInTheDocument()
  })
})
