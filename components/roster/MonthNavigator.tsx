'use client'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  year: number
  month: number // 1-based
  onChange: (year: number, month: number) => void
}

export default function MonthNavigator({ year, month, onChange }: Props) {
  const prev = () => month === 1 ? onChange(year - 1, 12) : onChange(year, month - 1)
  const next = () => month === 12 ? onChange(year + 1, 1) : onChange(year, month + 1)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-sm"
      >
        ←
      </button>
      <span className="font-semibold text-slate-800 w-40 text-center">
        {MONTHS[month - 1]} {year}
      </span>
      <button
        onClick={next}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-sm"
      >
        →
      </button>
    </div>
  )
}
