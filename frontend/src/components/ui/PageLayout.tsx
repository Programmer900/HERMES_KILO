import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  gradientFrom: string
  gradientTo: string
  children: ReactNode
}

export default function PageLayout({ title, gradientFrom, gradientTo, children }: PageLayoutProps) {
  return (
    <div className="p-4 pb-20">
      <h1
        className={`text-3xl font-bold mb-6 bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
      >
        {title}
      </h1>
      {children}
    </div>
  )
}
