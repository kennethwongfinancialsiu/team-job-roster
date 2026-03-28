import { supabase } from '@/lib/supabase'
import { Employee, EmployeeRole } from '@/lib/types'

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function addEmployee(name: string, role: EmployeeRole): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({ name, role, status: 'active' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
  if (error) throw error
}
