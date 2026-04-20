'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const t = setTimeout(() => setShow(false), 600)
    return () => clearTimeout(t)
  }, [pathname])

  if (!show) return null
  return <div className="nav-progress" />
}
