import { describe, it, expect } from 'vitest'
import { configSlice, initialState, setBlockingScope } from '@/redux/slices/configSlice'

describe('configSlice - blockingScope', () => {
  it('should have blockingScope as undefined in initial state', () => {
    expect(initialState.blockingScope).toBeUndefined()
  })

  it('should set blockingScope to "event"', () => {
    const action = setBlockingScope('event')
    const state = configSlice.reducer(initialState, action)
    expect(state.blockingScope).toBe('event')
  })

  it('should set blockingScope to "general"', () => {
    const action = setBlockingScope('general')
    const state = configSlice.reducer(initialState, action)
    expect(state.blockingScope).toBe('general')
  })

  it('should set blockingScope to undefined', () => {
    // First set it to a value
    const setAction = setBlockingScope('general')
    const stateWithValue = configSlice.reducer(initialState, setAction)
    expect(stateWithValue.blockingScope).toBe('general')

    // Then set it back to undefined
    const unsetAction = setBlockingScope(undefined)
    const finalState = configSlice.reducer(stateWithValue, unsetAction)
    expect(finalState.blockingScope).toBeUndefined()
  })

  it('should preserve other state when setting blockingScope', () => {
    const modifiedState = {
      ...initialState,
      eventContainer: 'test-container',
      title: 'Test Title',
    }

    const action = setBlockingScope('general')
    const newState = configSlice.reducer(modifiedState, action)

    expect(newState.blockingScope).toBe('general')
    expect(newState.eventContainer).toBe('test-container')
    expect(newState.title).toBe('Test Title')
  })

  it('should handle blockingScope in setBulkConfigSliceState', () => {
    const bulkUpdate = {
      eventContainer: 'free-30',
      blockingScope: 'general' as const,
      title: 'Free 30 Minute Session',
    }

    const action = { type: 'config/setBulkConfigSliceState', payload: bulkUpdate }
    const state = configSlice.reducer(initialState, action)

    expect(state.blockingScope).toBe('general')
    expect(state.eventContainer).toBe('free-30')
    expect(state.title).toBe('Free 30 Minute Session')
  })
})
