import { useState, useEffect, useRef, useCallback } from "react"

const GLITCH_CHARS = "01!@#$%^&*_-+=<>?"

type Phase = "hidden" | "scrambling" | "visible" | "fading"

export function useScrambleText() {
    const [target, setTarget] = useState<string | null>(null)
    const [displayText, setDisplayText] = useState("")
    const [animPhase, setAnimPhase] = useState<Phase>("hidden")
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    const trigger = useCallback((text: string) => {
        setAnimPhase("scrambling")
        setTarget(text)
    }, [])

    useEffect(() => {
        if (!target) return

        timeoutsRef.current.forEach(clearTimeout)
        timeoutsRef.current = []

        let iteration = 0

        const interval = setInterval(() => {
            setDisplayText(
                target
                    .split("")
                    .map((char, i) => {
                        if (char === " ") return " "
                        if (i < iteration) return char
                        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                    })
                    .join("")
            )

            if (iteration >= target.length) {
                clearInterval(interval)
                setAnimPhase("visible")

                const fadeTimeout = setTimeout(() => setAnimPhase("fading"), 3000)
                const hideTimeout = setTimeout(() => setAnimPhase("hidden"), 3500)

                timeoutsRef.current.push(fadeTimeout, hideTimeout)
            }
            iteration += 1
        }, 30)

        return () => {
            clearInterval(interval)
            timeoutsRef.current.forEach(clearTimeout)
        }
    }, [target])

    return { displayText, phase: animPhase, trigger }
}
