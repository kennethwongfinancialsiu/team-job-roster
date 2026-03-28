'use client'

import { useEffect, useState } from 'react'
import { Employee, EmployeeRole } from '@/lib/types'
import { getEmployees, addEmployee, removeEmployee } from '@/services/employees'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [role, setRole] = useState<EmployeeRole>('maker')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getEmployees().then((data) => { setEmployees(data); setLoading(false) })
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const emp = await addEmployee(name.trim(), role)
      setEmployees((prev) => [...prev, emp].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string, empName: string) => {
    if (!confirm(`Remove "${empName}"? This will also remove their roster assignments.`)) return
    await removeEmployee(id)
    setEmployees((prev) => prev.filter((e) => e.id !== id))
  }

  const makers = employees.filter((e) => e.role === 'maker')
  const approvers = employees.filter((e) => e.role === 'approver')

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Employees</h1>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex flex-wrap gap-3 items-end shadow-sm"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Employee name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as EmployeeRole)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="maker">Maker</option>
            <option value="approver">Approver</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          Add Employee
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : (
        <div className="space-y-6">
          <Section
            title="Makers"
            badge="bg-blue-100 text-blue-700"
            employees={makers}
            onRemove={handleRemove}
          />
          <Section
            title="Approvers"
            badge="bg-purple-100 text-purple-700"
            employees={approvers}
            onRemove={handleRemove}
          />
        </div>
      )}
    </div>
  )
}

function Section({
  title, badge, employees, onRemove,
}: {
  title: string
  badge: string
  employees: Employee[]
  onRemove: (id: string, name: string) => void
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
        {title} ({employees.length})
      </h2>
      {employees.length === 0 ? (
        <p className="text-slate-400 text-sm">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {employees.map((emp, i) => (
            <div
              key={emp.id}
              className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-800 font-medium text-sm">{emp.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
                  {emp.role}
                </span>
              </div>
              <button
                onClick={() => onRemove(emp.id, emp.name)}
                className="text-slate-400 hover:text-red-500 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
