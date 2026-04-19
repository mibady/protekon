"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

/**
 * Minimal HTML canvas signature pad with pointer-event support (touch +
 * mouse). Exposes `getDataURL()` and `clear()` via ref so the signer page
 * can pull the PNG payload at submit time.
 *
 * Kept dependency-free on purpose — loading a signature library would
 * bloat a page that has to load instantly on a site worker's phone.
 */
export type SignaturePadHandle = {
  getDataURL: () => string
  clear: () => void
  isEmpty: () => boolean
}

type SignaturePadProps = {
  height?: number // CSS px
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ height = 180 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const drawingRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const [hasInk, setHasInk] = useState(false)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // High-DPI backing store so ink is crisp on phones.
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = 2.2
      ctx.strokeStyle = "#0a1323"
    }, [])

    function pointFromEvent(
      e: React.PointerEvent<HTMLCanvasElement>
    ): { x: number; y: number } {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function onDown(e: React.PointerEvent<HTMLCanvasElement>): void {
      e.preventDefault()
      drawingRef.current = true
      lastPointRef.current = pointFromEvent(e)
      canvasRef.current?.setPointerCapture(e.pointerId)
    }

    function onMove(e: React.PointerEvent<HTMLCanvasElement>): void {
      if (!drawingRef.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const next = pointFromEvent(e)
      const last = lastPointRef.current ?? next
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
      lastPointRef.current = next
      if (!hasInk) setHasInk(true)
    }

    function onUp(e: React.PointerEvent<HTMLCanvasElement>): void {
      drawingRef.current = false
      lastPointRef.current = null
      canvasRef.current?.releasePointerCapture(e.pointerId)
    }

    useImperativeHandle(
      ref,
      () => ({
        getDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
        clear: () => {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext("2d")
          if (!ctx) return
          const dpr = window.devicePixelRatio || 1
          ctx.save()
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.restore()
          ctx.scale(dpr, dpr)
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.lineWidth = 2.2
          ctx.strokeStyle = "#0a1323"
          setHasInk(false)
        },
        isEmpty: () => !hasInk,
      }),
      [hasInk]
    )

    return (
      <div
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          height,
          width: "100%",
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
        />
      </div>
    )
  }
)
