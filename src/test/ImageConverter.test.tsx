import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { vi } from 'vitest'

vi.mock('heic2any', () => ({
  default: vi.fn(),
}))

import ImageConverter from '../renderer/src/components/tools/ImageConverter'

describe('ImageConverter', () => {
  it('renders title and description', () => {
    render(<ImageConverter />)
    expect(screen.getByText('Image Converter')).toBeInTheDocument()
    expect(screen.getByText(/Convert images between formats/i)).toBeInTheDocument()
  })

  it('shows upload prompt in initial state', () => {
    render(<ImageConverter />)
    expect(screen.getByText(/Click to upload an image/i)).toBeInTheDocument()
  })

  it('renders hidden file input', () => {
    render(<ImageConverter />)
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })
})
