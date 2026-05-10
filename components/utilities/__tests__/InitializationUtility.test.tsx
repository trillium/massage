import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import { setSelectedDate } from '@/redux/slices/availabilitySlice'
import { InitializationUtility } from '@/components/utilities/UpdateSlotsUtility'

function renderWithStore(
  ui: React.ReactElement,
  store = makeStore()
): { store: ReturnType<typeof makeStore> } {
  render(<Provider store={store}>{ui}</Provider>)
  return { store }
}

describe('InitializationUtility — selectedDate initialization', () => {
  it('sets selectedDate from URL param when Redux state is empty', async () => {
    const { store } = renderWithStore(<InitializationUtility initialSelectedDate="2026-05-12" />)

    await waitFor(() => {
      expect(store.getState().availability.selectedDate).toBe('2026-05-12')
    })
  })

  it('URL param overrides stale Redux selectedDate (regression: was silently ignored)', async () => {
    const store = makeStore()
    store.dispatch(setSelectedDate('2026-05-10'))

    expect(store.getState().availability.selectedDate).toBe('2026-05-10')

    renderWithStore(<InitializationUtility initialSelectedDate="2026-05-12" />, store)

    await waitFor(() => {
      expect(store.getState().availability.selectedDate).toBe('2026-05-12')
    })
  })

  it('does not set selectedDate when no initialSelectedDate provided', async () => {
    const store = makeStore()
    store.dispatch(setSelectedDate('2026-05-10'))

    renderWithStore(<InitializationUtility />, store)

    await waitFor(() => {
      expect(store.getState().availability.selectedDate).toBe('2026-05-10')
    })
  })
})
