// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '@/components/marketing/ContactForm'
import { ApiError } from '@/lib/api-client'

const post = vi.hoisted(() => vi.fn())
vi.mock('@/lib/api-client', async (orig) => ({ ...(await orig<typeof import('@/lib/api-client')>()), api: { post } }))

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Ada Obi')
  await user.type(screen.getByLabelText('Email address'), 'ada@example.com')
  await user.type(screen.getByLabelText('Subject'), 'Pricing question')
  await user.type(screen.getByLabelText('Message'), 'Hello, I would like to know more.')
}

describe('contact form', () => {
  beforeEach(() => { post.mockReset() })

  it('shows validation errors and does not call the API when empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('submits valid data and shows success', async () => {
    post.mockResolvedValue({})
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(post).toHaveBeenCalledWith('/contact', expect.objectContaining({ email: 'ada@example.com', website: '' }))
    expect(await screen.findByText('Message sent')).toBeInTheDocument()
  })

  it('shows server-side field errors', async () => {
    post.mockImplementation(async () => { throw new ApiError(422, 'Invalid', { email: ['That address is blocked.'] }) })
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByText('That address is blocked.')).toBeInTheDocument()
  })
})
