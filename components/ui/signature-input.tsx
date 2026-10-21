'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  RefObject,
} from 'react'

import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

type SignatureInputProps = {
  canvasRef?: RefObject<HTMLCanvasElement | null>
  onSignatureChange: (signature: string | null) => void
}

type Position = {
  x: number
  y: number
}

type CanvasEvent =
  | ReactMouseEvent<HTMLCanvasElement>
  | ReactTouchEvent<HTMLCanvasElement>

export default function SignatureInput({
  canvasRef: externalCanvasRef,
  onSignatureChange,
}: SignatureInputProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const lastPositionRef = useRef<Position | null>(null)
  const isDrawingRef = useRef(false)

  const [hasSignature, setHasSignature] = useState(false)

  const canvasRef = externalCanvasRef ?? internalCanvasRef

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    context.lineWidth = 2
    context.lineCap = 'round'
    context.lineJoin = 'round'

    const updateStrokeColor = () => {
      const root = document.documentElement
      const isDarkClass = root.classList.contains('dark')
      const isLightClass = root.classList.contains('light')
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches

      const isDarkMode =
        isDarkClass || (!isLightClass && systemPrefersDark)

      context.strokeStyle = isDarkMode ? '#ffffff' : '#000000'
    }

    const preventTouchScroll = (event: globalThis.TouchEvent) => {
      event.preventDefault()
    }

    updateStrokeColor()

    canvas.addEventListener('touchstart', preventTouchScroll, {
      passive: false,
    })
    canvas.addEventListener('touchmove', preventTouchScroll, {
      passive: false,
    })

    const observer = new MutationObserver(updateStrokeColor)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    )

    mediaQuery.addEventListener('change', updateStrokeColor)

    return () => {
      canvas.removeEventListener('touchstart', preventTouchScroll)
      canvas.removeEventListener('touchmove', preventTouchScroll)

      observer.disconnect()
      mediaQuery.removeEventListener('change', updateStrokeColor)
    }
  }, [canvasRef])

  const getPosition = (event: CanvasEvent): Position | null => {
    const canvas = canvasRef.current

    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    const point =
      'touches' in event
        ? event.touches[0] ?? event.changedTouches[0]
        : event

    if (!point) return null

    return {
      x: (point.clientX - rect.left) * (canvas.width / rect.width),
      y: (point.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (event: CanvasEvent) => {
    event.preventDefault()

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const position = getPosition(event)

    if (!canvas || !context || !position) return

    isDrawingRef.current = true
    lastPositionRef.current = position

    context.beginPath()
    context.moveTo(position.x, position.y)
  }

  const draw = (event: CanvasEvent) => {
    if (!isDrawingRef.current) return

    event.preventDefault()

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const position = getPosition(event)

    if (!canvas || !context || !position) return

    const lastPosition = lastPositionRef.current

    if (lastPosition) {
      const midX = (lastPosition.x + position.x) / 2
      const midY = (lastPosition.y + position.y) / 2

      context.beginPath()
      context.moveTo(lastPosition.x, lastPosition.y)
      context.quadraticCurveTo(
        lastPosition.x,
        lastPosition.y,
        midX,
        midY,
      )
      context.stroke()
    }

    lastPositionRef.current = position
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawingRef.current) return

    isDrawingRef.current = false
    lastPositionRef.current = null

    const canvas = canvasRef.current

    if (!canvas) return

    onSignatureChange(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)

    isDrawingRef.current = false
    lastPositionRef.current = null

    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="relative w-full max-w-100 overflow-hidden rounded-md border border-gray-300">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="block h-auto w-full touch-none"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        onTouchMove={draw}
        aria-label="Zone de signature"
        role="img"
      />

      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute bottom-2 left-2 z-10 rounded-full"
        onClick={clearSignature}
        disabled={!hasSignature}
        aria-label="Effacer la signature"
        title="Effacer la signature"
      >
        <Eraser className="h-4 w-4 text-muted-foreground hover:text-primary" />
      </Button>
    </div>
  )
}