import { renderHook, act } from "@testing-library/react"
import { useScrambleText } from "../../features/profile/hooks/useScrambleText"

describe("useScrambleText", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("starts in hidden phase with empty display text", () => {
        const { result } = renderHook(() => useScrambleText())

        expect(result.current.phase).toBe("hidden")
        expect(result.current.displayText).toBe("")
    })

    it("transitions to scrambling when triggered", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("hello"))

        expect(result.current.phase).toBe("scrambling")
    })

    it("displays scrambled text during scrambling phase", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("hello"))
        act(() => vi.advanceTimersByTime(30))

        expect(result.current.displayText).toHaveLength(5)
        expect(result.current.displayText).not.toBe("hello")
    })

    it("resolves to target text after scramble completes", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("hello"))
        // 5 chars + 1 extra iteration to detect completion = 6 ticks * 30ms
        act(() => vi.advanceTimersByTime(30 * 6))

        expect(result.current.displayText).toBe("hello")
        expect(result.current.phase).toBe("visible")
    })

    it("preserves spaces during scramble", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("a b"))
        act(() => vi.advanceTimersByTime(30))

        expect(result.current.displayText[1]).toBe(" ")
    })

    it("transitions to fading after 3 seconds", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("hi"))
        act(() => vi.advanceTimersByTime(30 * 3)) // complete scramble
        act(() => vi.advanceTimersByTime(3000))

        expect(result.current.phase).toBe("fading")
    })

    it("transitions to hidden after 3.5 seconds", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("hi"))
        act(() => vi.advanceTimersByTime(30 * 3)) // complete scramble
        act(() => vi.advanceTimersByTime(3500))

        expect(result.current.phase).toBe("hidden")
    })

    it("resets animation when triggered again before completion", () => {
        const { result } = renderHook(() => useScrambleText())

        act(() => result.current.trigger("first"))
        act(() => vi.advanceTimersByTime(30 * 2)) // mid-scramble

        act(() => result.current.trigger("second"))
        act(() => vi.advanceTimersByTime(30 * 7)) // complete new scramble

        expect(result.current.displayText).toBe("second")
        expect(result.current.phase).toBe("visible")
    })
})
