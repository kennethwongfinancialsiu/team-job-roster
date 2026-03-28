'use client'

import { useEffect, useRef, useState } from 'react'
import { Employee, Leave } from '@/lib/types'
import { isOnLeave } from '@/services/leaves'

interface Props {
  date: string
  jobId: string
  makerId: string | null
  employees: Employee[]
  leaves: Leave[]
  onAssign: (date: string, jobId: string, makerId: string | null) => Promise<void>
}

export default function RosterCell({
  date, jobId, makerId, employees, leaves, onAssign,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const selectRef = useRef<HTMLSelectElement>(null)

  // Available makers = active makers NOT on leave that day
  const availableMakers = employees.filter(
    (e) => e.role === 'maker' && e.status === 'active' && !isOnLeave(e.id, date, leaves)
  )

  // Always include the currently assigned maker in the list even if on leave,
  // so the <select> has a matching option for its current value.
  const currentMaker = employees.find((e) => e.id === makerId)
  const options =
    currentMaker && !availableMakers.some((e) => e.id === currentMaker.id)
      ? [currentMaker, ...availableMakers]
      : availableMakers

  const assignedName = currentMaker?.name ?? null
  const assignedOnLeave = makerId ? isOnLeave(makerId, date, leaves) : false

  useEffect(() => {
    if (editing) selectRef.current?.focus()
  }, [editing])

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || null
    setSaving(true)
    try {
      await onAssign(date, jobId, val)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <td className="border border-slate-200 p-0 min-w-[130px]">
        <select
          ref={selectRef}
          defaultValue={makerId ?? ''}
          onChange={handleChange}
          onBlur={() => !saving && setEditing(false)}
          disabled={saving}
          className="w-full h-full px-2 py-2 text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
        >
          <option value="">— Unassign —</option>
          {options.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}{isOnLeave(e.id, date, leaves) ? ' (on leave)' : ''}
            </option>
          ))}
        </select>
      </td>
    )
  }

  return (
    <td
      onClick={() => setEditing(true)}
      title="Click to assign"
      className="border border-slate-200 px-3 py-2 min-w-[130px] cursor-pointer hover:bg-blue-50 transition-colors"
    >
      {assignedName ? (
        <span className={`text-sm ${assignedOnLeave ? 'text-amber-600 font-medium' : 'text-slate-700'}`}>
          {assignedName}
          {assignedOnLeave && (
            <span className="ml-1 text-xs text-amber-500" title="This maker is on leave">⚠</span>
          )}
        </span>
      ) : (
        <span className="text-slate-300 text-sm">—</span>
      )}
    </td>
  )
}
