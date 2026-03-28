import { supabase } from '@/lib/supabase'
import { Leave } from '@/lib/types'

export async function getLeaves(): Promise<Leave[]> {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('start_date')
  if (error) throw error
  return data ?? []
}

export async function addLeave(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<Leave> {
  const { data, error } = await supabase
    .from('leaves')
    .insert({ employee_id: employeeId, start_date: startDate, end_date: endDate })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeLeave(id: string): Promise<void> {
  const { error } = await supabase.from('leaves').delete().eq('id', id)
  if (error) throw error
}

/**
 * String comparison is safe for ISO "YYYY-MM-DD" — avoids timezone pitfalls
 * that occur when constructing Date objects from date-only strings.
 */
export function isOnLeave(
  employeeId: string,
  date: string,
  leaves: Leave[]
): boolean {
  return leaves.some(
    (l) =>
      l.employee_id === employeeId &&
      date >= l.start_date &&
      date <= l.end_date
  )
}
