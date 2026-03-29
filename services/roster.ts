import { supabase } from '@/lib/supabase'
import { RosterAssignment } from '@/lib/types'

export async function getAssignmentsForMonth(
  year: number,
  month: number
): Promise<RosterAssignment[]> {
  const mm = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const from = `${year}-${mm}-01`
  const to = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('roster_assignments')
    .select('*')
    .gte('date', from)
    .lte('date', to)
  if (error) throw error
  return data ?? []
}

export async function upsertAssignment(
  date: string,
  jobId: string,
  makerId: string | null
): Promise<void> {
  if (makerId === null) {
    // No row = unassigned
    const { error } = await supabase
      .from('roster_assignments')
      .delete()
      .eq('date', date)
      .eq('job_id', jobId)
    if (error) throw error
    return
  }

  // onConflict must be 'date,job_id' — no spaces, matches the unique constraint columns
  const { error } = await supabase
    .from('roster_assignments')
    .upsert(
      { date, job_id: jobId, maker_id: makerId },
      { onConflict: 'date,job_id' }
    )
  if (error) throw error
}

/** Insert multiple assignments at once (used by auto-populate). Skips conflicts. */
export async function bulkUpsertAssignments(
  rows: Array<{ date: string; job_id: string; maker_id: string }>
): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase
    .from('roster_assignments')
    .upsert(rows, { onConflict: 'date,job_id' })
  if (error) throw error
}
