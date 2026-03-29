'use client'

import { useCallback, useEffect, useState } from 'react'
import { Employee, Job, Leave, RosterAssignment } from '@/lib/types'
import { getEmployees } from '@/services/employees'
import { getJobs } from '@/services/jobs'
import { getAssignmentsForMonth, upsertAssignment, bulkUpsertAssignments } from '@/services/roster'
import { getLeaves, isOnLeave } from '@/services/leaves'
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
  const [autoFilling, setAutoFilling] = useState(false)
  const [fillMessage, setFillMessage] = useState<string | null>(null)
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

  const handleAutoFill = async () => {
    const activeJobs = jobs.filter((j) => j.active)
    const activeMakers = employees.filter((e) => e.role === 'maker' && e.status === 'active')

    if (activeMakers.length === 0) {
      setFillMessage('No active makers found. Add makers on the Employees page first.')
      return
    }
    if (activeJobs.length === 0) {
      setFillMessage('No active jobs found. Add jobs on the Jobs page first.')
      return
    }

    setAutoFilling(true)
    setFillMessage(null)

    // Build existing assignment lookup to skip already-filled cells
    const existing = new Set(assignments.map((a) => `${a.date}:${a.job_id}`))

    // Generate all dates in the month
    const mm = String(month).padStart(2, '0')
    const daysInMonth = new Date(year, month, 0).getDate()
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      `${year}-${mm}-${String(i + 1).padStart(2, '0')}`
    )

    // Track total assignments per maker across the whole month (existing + new).
    // This is used to prioritise the least-loaded maker each day, keeping
    // the monthly workload balanced even when some makers are on leave.
    const makerLoad: Record<string, number> = {}
    activeMakers.forEach((m) => { makerLoad[m.id] = 0 })
    assignments.forEach((a) => {
      if (makerLoad[a.maker_id] !== undefined) makerLoad[a.maker_id]++
    })

    const newRows: Array<{ date: string; job_id: string; maker_id: string }> = []

    for (const date of dates) {
      // 1. Get makers available this day (not on leave), sorted by least load first.
      //    Tie-break by name for deterministic ordering.
      const available = activeMakers
        .filter((m) => !isOnLeave(m.id, date, leaves))
        .sort((a, b) => makerLoad[a.id] - makerLoad[b.id] || a.name.localeCompare(b.name))

      if (available.length === 0) continue

      // 2. Get jobs that still need an assignment today
      const unassigned = activeJobs.filter((j) => !existing.has(`${date}:${j.id}`))

      // 3. Assign jobs to makers.
      //    First pass: 1 job per maker (ideal case — no maker does 2 jobs if avoidable).
      //    If jobs > makers, cycle back for a second pass (overflow only).
      for (let i = 0; i < unassigned.length; i++) {
        const maker = available[i % available.length]
        const job = unassigned[i]

        newRows.push({ date, job_id: job.id, maker_id: maker.id })
        existing.add(`${date}:${job.id}`)
        makerLoad[maker.id]++
      }
    }

    try {
      await bulkUpsertAssignments(newRows)
      // Merge new rows into local state
      setAssignments((prev) => {
        const merged = [...prev]
        for (const row of newRows) {
          if (!merged.some((a) => a.date === row.date && a.job_id === row.job_id)) {
            merged.push({ id: '', ...row })
          }
        }
        return merged
      })
      setFillMessage(
        newRows.length > 0
          ? `Auto-filled ${newRows.length} cell${newRows.length !== 1 ? 's' : ''} using round-robin distribution.`
          : 'All cells are already assigned — nothing to fill.'
      )
    } catch (e) {
      setFillMessage('Auto-fill failed. Please try again.')
      console.error(e)
    } finally {
      setAutoFilling(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Roster</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any cell to assign a maker</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthNavigator year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
          <button
            onClick={handleAutoFill}
            disabled={loading || autoFilling}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {autoFilling ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                Filling…
              </>
            ) : (
              '⚡ Auto-fill Month'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {fillMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm mb-4 flex items-center justify-between">
          <span>{fillMessage}</span>
          <button onClick={() => setFillMessage(null)} className="text-emerald-400 hover:text-emerald-600 ml-4">✕</button>
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
