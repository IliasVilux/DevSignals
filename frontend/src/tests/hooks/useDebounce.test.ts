import { renderHook, act } from "@testing-library/react"
import { useDebounce } from "../../shared/hooks/useDebounce"

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("should return the initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("initial", 500))

        expect(result.current).toBe("initial")
    })

    it("should not update the value before the delay expires", () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 },
        })

        rerender({ value: "updated", delay: 500 })
        act(() => {
            vi.advanceTimersByTime(499)
        })

        expect(result.current).toBe("initial")
    })

    it("should update the value after the delay expires", () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 },
        })

        rerender({ value: "updated", delay: 500 })
        act(() => {
            vi.advanceTimersByTime(500)
        })

        expect(result.current).toBe("updated")
    })

    it("should reset the delay if the value changes before the delay expires", () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 },
        })

        rerender({ value: "first change", delay: 500 })
        act(() => {
            vi.advanceTimersByTime(300)
        })

        rerender({ value: "second change", delay: 500 })
        act(() => {
            vi.advanceTimersByTime(300)
        })

        // 300 + 300 = 600ms total, but the delay reset on second change
        // so only 300ms have passed since the last change
        expect(result.current).toBe("initial")

        act(() => {
            vi.advanceTimersByTime(200)
        })

        expect(result.current).toBe("second change")
    })
})
