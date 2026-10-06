import { useState } from 'react'
import { Button } from '../ui/button' 
import { Link } from 'react-router-dom' 
import { Plus } from 'lucide-react'
import AdminJobsTable from './AdminJobsTable'
import useFetch from '@/hooks/useFetch'
import PageHeader, { SearchInput } from './PageHeader'

const AdminJobs = () => {
  const { data, setData, loading, error, refetch } = useFetch("/job/getadminjobs");
  const [input, setInput] = useState("");
  const jobs = data?.jobs || [];

  const sum = (key) => jobs.reduce((total, job) => total + (job[key] || 0), 0);
  const stats = [
    { label: "Jobs posted", value: jobs.length },
    { label: "Open jobs", value: jobs.filter((job) => job.isOpen).length },
    { label: "Total applicants", value: sum("applicantsCount") },
    { label: "Awaiting review", value: sum("pendingCount") },
  ];

  return (
    <div className='page py-8'>
      <PageHeader
        title="Jobs"
        description="Roles you have posted and how many people applied."
        action={<Button asChild><Link to="/admin/jobs/create"><Plus className='mr-2 h-4 w-4' /> Post a job</Link></Button>}
      />
      <div className='mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {
          stats.map((stat) => (
            <div key={stat.label} className='surface p-4'>
              <p className='text-xs text-muted-foreground'>{stat.label}</p>
              <p className='mt-1 text-2xl font-bold'>{loading || error ? "—" : stat.value}</p>
            </div>
          ))
        }
      </div>
      <div className='mt-6'>
        <SearchInput value={input} onChange={setInput} placeholder="Filter by role or company" />
      </div>
      <div className='surface mt-4 overflow-hidden'>
        <AdminJobsTable
          jobs={data?.jobs}
          search={input}
          loading={loading}
          error={error}
          onRetry={refetch}
          onDeleted={(id) => setData({ ...data, jobs: jobs.filter((job) => job._id !== id) })}
          onStatusChanged={(id, isOpen) => setData({ ...data, jobs: jobs.map((job) => job._id === id ? { ...job, isOpen } : job) })}
        />
      </div>
    </div>
  )
}

export default AdminJobs
