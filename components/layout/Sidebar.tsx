'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',           label: 'Roster',    icon: '📅' },
  { href: '/employees',  label: 'Employees', icon: '👥' },
  { href: '/jobs',       label: 'Jobs',      icon: '💼' },
  { href: '/leaves',     label: 'Leaves',    icon: '🌴' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-slate-800 min-h-screen flex flex-col flex-shrink-0">
      <div className="px-5 py-6 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Internal Tool</p>
        <h1 className="text-white font-bold text-lg leading-snug">Team Job Roster</h1>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
