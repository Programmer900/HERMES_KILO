import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  compact?: boolean
  className?: string
}

export default function Card({ children, compact, className = '' }: CardProps) {
  return (
    <div className={`bg-gray-800/50 rounded-xl ${compact ? 'p-4' : 'p-6'} backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}
