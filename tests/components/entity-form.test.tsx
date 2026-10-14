// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntityForm from '@/components/shared/EntityForm'
import { ApiError } from '@/lib/api-client'

const fields = [{ name: 'name', label: 'Name', required: true }]

describe('EntityForm', () => {
  it('blocks submit when a required field is empty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<EntityForm open onOpenChange={() => {}} title='Add department' fields={fields} onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the entered values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<EntityForm open onOpenChange={() => {}} title='Add department' fields={fields} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Name'), 'Accounting')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Accounting' })
  })

  it('shows server validation errors next to the field', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(422, 'Invalid', { name: ['That name is already used.'] }))
    const user = userEvent.setup()
    render(<EntityForm open onOpenChange={() => {}} title='Add department' fields={fields} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Name'), 'Accounting')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText('That name is already used.')).toBeInTheDocument()
  })
})
