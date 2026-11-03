"use client"

import * as React from "react"
import { MotionConfig } from "framer-motion"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
