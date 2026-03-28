'use client'

import { useEffect, useState } from 'react'
import { Job } from '@/lib/types'
import { getJobs, addJob, updateJob, removeJob } from '@/services/jobs'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    getJobs().then((data) => { setJobs(data); setLoading(false) })
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      const job = await addJob(newName.trim())
      setJobs((prev) => [...prev, job])
      setNewName('')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    const updated = await updateJob(id, editName.trim())
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)))
    setEditId(null)
  }

  const handleRemove = async (id: string, jobName: string) => {
    if (!confirm(`Remove "${jobName}"? All roster assignments for this job will also be removed.`)) return
    await removeJob(id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Jobs</h1>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex gap-3 items-end shadow-sm"
      >
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Job Name</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Quality Check"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          Add Job
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-400 text-sm">No jobs yet. Add one above.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              {editId === job.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(job.id)}
                    autoFocus
                    className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm flex-1 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(job.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-slate-800 font-medium text-sm">{job.name}</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => { setEditId(job.id); setEditName(job.name) }}
                      className="text-slate-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(job.id, job.name)}
                      className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
