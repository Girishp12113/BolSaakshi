'use client'

import React from "react"
import { motion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const container = (stagger: number, delay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

const item = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.55, ease: EASE },
  },
}

export interface StaggerTextProps {
  children: React.ReactNode
  delay?: number
  divideBy?: "word" | "letter"
  className?: string
}

export function StaggerText({
  children,
  delay = 0,
  divideBy = "word",
  className = "",
}: StaggerTextProps) {
  if (typeof children !== "string") {
    if (typeof children === "number" || typeof children === "boolean") {
      children = String(children)
    } else {
      return <span className={className}>{children}</span>
    }
  }

  const text = children as string
  const parts = divideBy === "letter" ? text.split("") : text.split(" ")
  const stagger = divideBy === "letter" ? 0.02 : 0.05

  return (
    <motion.span
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={`inline-block ${className}`}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden relative"
          style={{ verticalAlign: "top" }}
        >
          <motion.span
            variants={item}
            className="inline-block will-change-transform"
          >
            {divideBy === "letter"
              ? part === " "
                ? "\u00A0"
                : part
              : part + "\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

export default StaggerText

