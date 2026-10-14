// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SelectField from '@/components/shared/SelectField'

vi.mock('@iconify/react', () => ({ Icon: () => <span /> }))

const options = [{ value: 'a', label: 'Network Support' }, { value: 'b', label: 'Hardware Support' }]

describe('SelectField (modern dropdown)', () => {
  it('opens, lists the options and reports the chosen value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<><label htmlFor='team'>Team</label><SelectField id='team' value='' onChange={onChange} options={options} /></>)
    const trigger = screen.getByRole('combobox', { name: 'Team' })
    expect(trigger).toHaveTextContent('Select...')
    await user.click(trigger)
    await user.click(await screen.findByRole('option', { name: 'Hardware Support' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('shows the chosen label and can be cleared with the clear item', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<><label htmlFor='team'>Team</label><SelectField id='team' value='a' onChange={onChange} options={options} clearLabel='All' /></>)
    const trigger = screen.getByRole('combobox', { name: 'Team' })
    expect(trigger).toHaveTextContent('Network Support')
    await user.click(trigger)
    await user.click(await screen.findByRole('option', { name: 'All' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('shows the clear label when nothing is chosen, and can be disabled', () => {
    render(<><label htmlFor='team'>Team</label><SelectField id='team' value='' onChange={() => {}} options={options} clearLabel='All' disabled /></>)
    const trigger = screen.getByRole('combobox', { name: 'Team' })
    expect(trigger).toHaveTextContent('All')
    expect(trigger).toBeDisabled()
  })
})
