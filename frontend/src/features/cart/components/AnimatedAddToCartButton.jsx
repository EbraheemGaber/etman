import { Button } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const MotionButton = motion(Button)

export const AnimatedAddToCartButton = ({
  onClick,
  children,
  successLabel = 'تمت الإضافة!',
  disabled = false,
  ...buttonProps
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const resetTimer = useRef()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const handleClick = async (event) => {
    if (isAdding || disabled || !onClick) return

    setIsAdding(true)
    try {
      const result = await onClick(event)
      if (result?.meta?.requestStatus !== 'fulfilled') return

      setIsAdded(true)
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setIsAdded(false), 1800)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <MotionButton
      {...buttonProps}
      type={buttonProps.type || 'button'}
      disabled={disabled || isAdding}
      onClick={handleClick}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.025 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      animate={
        isAdded && !prefersReducedMotion
          ? {
              scale: [1, 1.06, 1],
              boxShadow: [
                '0 0 0 rgba(46,125,50,0)',
                '0 0 22px rgba(46,125,50,.45)',
                '0 0 0 rgba(46,125,50,0)',
              ],
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <span
        aria-live="polite"
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isAdded ? 'added' : 'idle'}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {isAdded && <CheckRoundedIcon fontSize="small" />}
            {isAdded ? successLabel : children}
          </motion.span>
        </AnimatePresence>
      </span>
    </MotionButton>
  )
}
