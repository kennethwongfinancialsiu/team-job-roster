'use client'

import { Employee, Job, Leave, RosterAssignment } from '@/lib/types'
import RosterCell from './RosterCell'

interface Props {
  year: number
  month: number
  jobs: Job[]
  employees: Employee[]
  assignments: RosterAssignment[]
  leaves: Leave[]
  onAssign: (date: string, jobId: string, makerId: string | null) => Promise<void>
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDatesInMonth(year: number, month: number): string[] {
  const count = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return Array.from({ length: count }, (_, i) =>
    `${year}-${mm}-${String(i + 1).padStart(2, '0')}`
  )
}

export default function RosterGrid({
  year, month, jobs, employees, assignments, leaves, onAssign,
}: Props) {
  const activeJobs = jobs.filter((j) => j.active)
  const dates = getDatesInMonth(year, month)

  // Lookup map: "YYYY-MM-DD:job_id" → assignment
  const map = new Map<string, RosterAssignment>()
  assignments.forEach((a) => map.set(`${a.date}:${a.job_id}`, a))

  if (activeJobs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-lg mb-1">No jobs yet</p>
        <p className="text-sm">Add jobs from the Jobs page to populate the roster.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 sticky left-0 z-10 min-w-[90px]">
              Date
            </th>
            {activeJobs.map((job) => (
              <th
                key={job.id}
                className="border-b border-r border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 min-w-[130px]"
              >
                {job.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => {
            const dow = new Date(date + 'T00:00:00').getDay()
            const weekend = dow === 0 || dow === 6
            return (
              <tr key={date} className={weekend ? 'bg-slate-50' : 'bg-white'}>
                <td
                  className={`border-b border-r border-slate-200 px-3 py-2 sticky left-0 z-10 whitespace-nowrap ${
                    weekend ? 'bg-slate-50' : 'bg-white'
                  }`}
                >
                  <span className="text-xs text-slate-400 mr-1.5">{DAY[dow]}</span>
                  <span className="font-medium text-slate-700">{date.slice(8)}</span>
                </td>
                {activeJobs.map((job) => {
                  const assignment = map.get(`${date}:${job.id}`)
                  return (
                    <RosterCell
                      key={job.id}
                      date={date}
                      jobId={job.id}
                      makerId={assignment?.maker_id ?? null}
                      employees={employees}
                      leaves={leaves}
                      onAssign={onAssign}
                    />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
