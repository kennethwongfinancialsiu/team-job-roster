'use client'

import { useCallback, useEffect, useState } from 'react'
import { Employee, Job, Leave, RosterAssignment } from '@/lib/types'
import { getEmployees } from '@/services/employees'
import { getJobs } from '@/services/jobs'
import { getAssignmentsForMonth, upsertAssignment } from '@/services/roster'
import { getLeaves } from '@/services/leaves'
import RosterGrid from '@/components/roster/RosterGrid'
import MonthNavigator from '@/components/roster/MonthNavigator'

export default function RosterPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [assignments, setAssignments] = useState<RosterAssignment[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [emps, jbs, asgns, lvs] = await Promise.all([
        getEmployees(),
        getJobs(),
        getAssignmentsForMonth(year, month),
        getLeaves(),
      ])
      setEmployees(emps)
      setJobs(jbs)
      setAssignments(asgns)
      setLeaves(lvs)
    } catch (e) {
      setError('Failed to load data. Check your Supabase connection.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { loadData() }, [loadData])

  const handleAssign = async (date: string, jobId: string, makerId: string | null) => {
    await upsertAssignment(date, jobId, makerId)
    // Optimistic update — no full refetch needed
    setAssignments((prev) => {
      const filtered = prev.filter((a) => !(a.date === date && a.job_id === jobId))
      if (makerId) {
        return [...filtered, { id: '', date, job_id: jobId, maker_id: makerId }]
      }
      return filtered
    })
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Roster</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any cell to assign a maker</p>
        </div>
        <MonthNavigator year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading roster…
        </div>
      ) : (
        <RosterGrid
          year={year}
          month={month}
          jobs={jobs}
          employees={employees}
          assignments={assignments}
          leaves={leaves}
          onAssign={handleAssign}
        />
      )}
    </div>
  )
}
