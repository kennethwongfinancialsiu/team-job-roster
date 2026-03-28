import { supabase } from '@/lib/supabase'
import { Job } from '@/lib/types'

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function addJob(name: string): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ name, active: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateJob(id: string, name: string): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeJob(id: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
  if (error) throw error
}
