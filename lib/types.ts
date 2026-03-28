export type EmployeeRole = 'maker' | 'approver'
export type EmployeeStatus = 'active' | 'inactive'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  status: EmployeeStatus
}

export interface Job {
  id: string
  name: string
  active: boolean
}

export interface RosterAssignment {
  id: string
  date: string       // "YYYY-MM-DD"
  job_id: string
  maker_id: string
}

export interface Leave {
  id: string
  employee_id: string
  start_date: string // "YYYY-MM-DD"
  end_date: string
}
