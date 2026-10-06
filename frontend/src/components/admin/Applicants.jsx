import { useState } from 'react'
import ApplicantsTable from './ApplicantsTable'
import { useParams } from 'react-router-dom';
import useFetch from '@/hooks/useFetch';
import PageHeader from './PageHeader';
import StatusBadge from '../shared/StatusBadge';
import { ErrorState, PageLoader } from '../shared/States';
import { cn } from '@/lib/utils';

const tabs = ["all", "pending", "accepted", "rejected"];

const Applicants = () => {
    const params = useParams();
    const { data, setData, loading, error, refetch } = useFetch(`/application/${params.id}/applicants`);
    const [tab, setTab] = useState("all");

    if (loading) return <PageLoader />
    if (error) return <div className='page py-10'><ErrorState message={error} onRetry={refetch} /></div>

    const job = data.job;
    // applications whose student account was deleted have no applicant
    const applications = job.applications.filter((application) => application.applicant);
    const count = (status) => status === "all" ? applications.length : applications.filter((application) => application.status === status).length;

    const onStatusChanged = (id, status) => {
        setData({ ...data, job: { ...job, applications: job.applications.map((application) => application._id === id ? { ...application, status } : application) } });
    }

    return (
        <div className='page py-8'>
            <PageHeader
                backTo="/admin/jobs"
                backLabel="Jobs"
                title={job.title}
                description={`${job.company?.name} · ${job.location} · ${job.jobType}`}
                action={<StatusBadge status={job.isOpen ? "open" : "closed"} />}
            />
            <div className='mt-6 flex flex-wrap gap-2' role="tablist" aria-label="Filter applicants by status">
                {
                    tabs.map((item) => (
                        <button
                            key={item}
                            role="tab"
                            aria-selected={tab === item}
                            onClick={() => setTab(item)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition',
                                tab === item ? 'border-primary bg-accent text-accent-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                            )}>
                            {item} <span className='ml-1 text-xs opacity-70'>{count(item)}</span>
                        </button>
                    ))
                }
            </div>
            <div className='surface mt-4 overflow-hidden'>
                <ApplicantsTable
                    applications={tab === "all" ? applications : applications.filter((application) => application.status === tab)}
                    total={applications.length}
                    onStatusChanged={onStatusChanged}
                />
            </div>
        </div>
    )
}

export default Applicants
