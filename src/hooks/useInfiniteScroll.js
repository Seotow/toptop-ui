import { useState, useEffect, useCallback, useRef } from 'react'

function useInfiniteScroll() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(null)
    const isScrollingRef = useRef(false)
    const timeoutRef = useRef(null)

    const throttleScroll = useCallback((callback, delay = 150) => {
        if (timeoutRef.current) return
        
        timeoutRef.current = setTimeout(() => {
            callback()
            timeoutRef.current = null
        }, delay)
    }, [])

    const handleScroll = useCallback((e) => {
        e.preventDefault()
        
        if (isScrollingRef.current) return
        
        const deltaY = e.deltaY
        const threshold = 50

        if (Math.abs(deltaY) > threshold) {
            throttleScroll(() => {
                if (deltaY > 0) {
                    setDirection('down')
                    setCurrentIndex(prev => prev + 1)
                } else {
                    setDirection('up')
                    setCurrentIndex(prev => Math.max(0, prev - 1))
                }
                
                isScrollingRef.current = true
                setTimeout(() => {
                    isScrollingRef.current = false
                }, 100)
            })
        }
    }, [throttleScroll])

    const handleKeyDown = useCallback((e) => {
        if (isScrollingRef.current) return
        
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setDirection('down')
            setCurrentIndex(prev => prev + 1)
            isScrollingRef.current = true
            setTimeout(() => {
                isScrollingRef.current = false
            }, 100)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setDirection('up')
            setCurrentIndex(prev => Math.max(0, prev - 1))
            isScrollingRef.current = true
            setTimeout(() => {
                isScrollingRef.current = false
            }, 100)
        }
    }, [])

    const goToNext = useCallback(() => {
        if (isScrollingRef.current) return
        setDirection('down')
        setCurrentIndex(prev => prev + 1)
    }, [])

    const goToPrevious = useCallback(() => {
        if (isScrollingRef.current) return
        setDirection('up')
        setCurrentIndex(prev => Math.max(0, prev - 1))
    }, [])

    useEffect(() => {
        const wheelHandler = (e) => handleScroll(e)
        const keyHandler = (e) => handleKeyDown(e)
        
        window.addEventListener('wheel', wheelHandler, { passive: false })
        window.addEventListener('keydown', keyHandler)

        return () => {
            window.removeEventListener('wheel', wheelHandler)
            window.removeEventListener('keydown', keyHandler)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [handleScroll, handleKeyDown])

    return {
        currentIndex,
        direction,
        goToNext,
        goToPrevious,
        setCurrentIndex
    }
}

export default useInfiniteScroll