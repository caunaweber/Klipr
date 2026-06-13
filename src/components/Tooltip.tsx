import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'

interface TooltipProps {
  children: ReactNode
  className?: string
  content: ReactNode
  fullWidth?: boolean
  tone?: 'default' | 'error'
}

export function Tooltip({
  children,
  className,
  content,
  fullWidth = true,
  tone = 'default',
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    placement: 'top' as 'bottom' | 'top',
  })

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current

    if (!trigger) {
      return
    }

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltipRef.current?.getBoundingClientRect()
    const tooltipWidth = tooltipRect?.width ?? 224
    const tooltipHeight = tooltipRect?.height ?? 40
    const viewportPadding = 8
    const gap = 8
    const centeredLeft = triggerRect.left + triggerRect.width / 2
    const minLeft = viewportPadding + tooltipWidth / 2
    const maxLeft = window.innerWidth - viewportPadding - tooltipWidth / 2
    const placement =
      triggerRect.top - tooltipHeight - gap >= viewportPadding
        ? 'top'
        : 'bottom'

    setPosition({
      left: Math.min(
        Math.max(centeredLeft, minLeft),
        maxLeft
      ),
      top:
        placement === 'top'
          ? triggerRect.top - gap
          : triggerRect.bottom + gap,
      placement,
    })
  }, [])

  const showTooltip = () => {
    updatePosition()
    setIsVisible(true)
  }

  const hideTooltip = () => {
    setIsVisible(false)
  }

  useLayoutEffect(() => {
    if (!isVisible) {
      return
    }

    updatePosition()

    window.addEventListener(
      'resize',
      updatePosition
    )
    window.addEventListener(
      'scroll',
      updatePosition,
      true
    )

    return () => {
      window.removeEventListener(
        'resize',
        updatePosition
      )
      window.removeEventListener(
        'scroll',
        updatePosition,
        true
      )
    }
  }, [isVisible, updatePosition])

  return (
    <span
      ref={triggerRef}
      className={cn(
        'inline-flex min-w-0',
        fullWidth && 'w-full',
        className,
      )}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && createPortal(
        <span
          ref={tooltipRef}
          className={cn(
            'pointer-events-none fixed z-[100] w-max max-w-56 rounded-md border px-2.5 py-1.5 text-xs font-medium leading-5 opacity-100 shadow-soft',
            position.placement === 'top'
              ? '-translate-x-1/2 -translate-y-full'
              : '-translate-x-1/2',
            tone === 'error'
              ? 'border-destructive/60 bg-destructive text-destructive-foreground'
              : 'border-border bg-secondary text-secondary-foreground',
          )}
          role="tooltip"
          style={{
            left: position.left,
            top: position.top,
          }}
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  )
}
