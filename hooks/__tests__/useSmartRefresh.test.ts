// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

import { useSmartRefresh } from '../useSmartRefresh'

describe('useSmartRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockRefresh.mockClear()
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls router.refresh on visibility change to visible', () => {
    renderHook(() => useSmartRefresh())

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockRefresh).not.toHaveBeenCalled()

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls router.refresh on 30s interval when visible', () => {
    renderHook(() => useSmartRefresh())

    vi.advanceTimersByTime(30_000)
    expect(mockRefresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(30_000)
    expect(mockRefresh).toHaveBeenCalledTimes(2)
  })

  it('skips interval refresh when tab is hidden', () => {
    renderHook(() => useSmartRefresh())

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    vi.advanceTimersByTime(30_000)
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('respects 15s cooldown between refreshes', () => {
    renderHook(() => useSmartRefresh())

    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(10_000)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5_000)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockRefresh).toHaveBeenCalledTimes(2)
  })

  it('cleans up listeners and interval on unmount', () => {
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useSmartRefresh())

    unmount()

    expect(removeListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(removeListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

    mockRefresh.mockClear()
    vi.advanceTimersByTime(60_000)
    expect(mockRefresh).not.toHaveBeenCalled()

    removeListenerSpy.mockRestore()
  })
})
