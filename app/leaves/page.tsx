'use client'

import { useEffect, useState } from 'react'
import { Employee, Leave } from '@/lib/types'
import { getEmployees } from '@/services/employees'
import { getLeaves, addLeave, removeLeave } from '@/services/leaves'

export default function LeavesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getEmployees(), getLeaves()]).then(([emps, lvs]) => {
      setEmployees(emps)
      setLeaves(lvs)
      if (emps.length > 0) setEmployeeId(emps[0].id)
      setLoading(false)
    })
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !startDate || !endDate) return
    setSaving(true)
    try {
      const leave = await addLeave(employeeId, startDate, endDate)
      setLeaves((prev) => [...prev, leave].sort((a, b) => a.start_date.localeCompare(b.start_date)))
      setStartDate('')
      setEndDate('')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    await removeLeave(id)
    setLeaves((prev) => prev.filter((l) => l.id !== id))
  }

  const getName = (id: string) => employees.find((e) => e.id === id)?.name ?? '—'

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Leave Management</h1>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Leave</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !employeeId || !startDate || !endDate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Add Leave
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : leaves.length === 0 ? (
        <p className="text-slate-400 text-sm">No leave records yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">From</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Days</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave, i) => {
                const start = new Date(leave.start_date + 'T00:00:00')
                const end = new Date(leave.end_date + 'T00:00:00')
                const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
                return (
                  <tr key={leave.id} className={i > 0 ? 'border-t border-slate-100' : ''}>
                    <td className="px-4 py-3 font-medium text-slate-800">{getName(leave.employee_id)}</td>
                    <td className="px-4 py-3 text-slate-600">{leave.start_date}</td>
                    <td className="px-4 py-3 text-slate-600">{leave.end_date}</td>
                    <td className="px-4 py-3 text-slate-500">{days}d</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(leave.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
