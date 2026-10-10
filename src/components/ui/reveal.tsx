"use client"

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number
}

const EASE = [0.22, 1, 0.36, 1] as const

/** Fades and lifts its children in once, as they scroll into view. */
export function Reveal({ delay = 0, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      viewport={{ margin: "0px 0px -80px 0px", once: true }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      {...props}
    />
  )
}
