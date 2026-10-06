import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Bookmark, Briefcase, CalendarDays, CheckCircle2, ExternalLink, IndianRupee, Loader2, MapPin, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import CompanyLogo from './shared/CompanyLogo'
import StatusBadge from './shared/StatusBadge'
import { ErrorState } from './shared/States'
import useFetch from '@/hooks/useFetch'
import useSavedJobs from '@/hooks/useSavedJobs'
import api, { getErrorMessage } from '@/lib/api'
import { formatDate, formatExperience, formatSalary, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const JobDescription = () => {
    const params = useParams();
    const jobId = params.id;
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useSelector(store=>store.auth);
    const { data, setData, loading, error, refetch } = useFetch(`/job/get/${jobId}`);
    const { canSave, isSaved, toggleSaved } = useSavedJobs();
    const [applying, setApplying] = useState(false);

    const job = data?.job;
    const isOwner = user?.role === 'recruiter' && job?.created_by === user?._id;

    const applyJobHandler = async () => {
        if (!user) {
            toast.info("Please login to apply.");
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        try {
            setApplying(true);
            const res = await api.post(`/application/apply/${jobId}`);
            if(res.data.success){
                // helps us to real time UI update
                setData({ ...data, job: { ...job, hasApplied: true, applicationStatus: "pending", applicantsCount: job.applicantsCount + 1 } });
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setApplying(false);
        }
    }

    if (loading) {
        return (
            <div className='page py-8'>
                <Skeleton className='h-5 w-28' />
                <div className='surface mt-5 p-6'>
                    <div className='flex items-center gap-4'>
                        <Skeleton className='h-14 w-14 rounded-2xl' />
                        <div className='space-y-2'><Skeleton className='h-6 w-64' /><Skeleton className='h-4 w-40' /></div>
                    </div>
                </div>
                <div className='mt-6 grid gap-6 lg:grid-cols-3'>
                    <Skeleton className='h-72 rounded-2xl lg:col-span-2' />
                    <Skeleton className='h-72 rounded-2xl' />
                </div>
            </div>
        )
    }
    if (error) return <div className='page py-10'><ErrorState message={error} onRetry={refetch} /></div>

    const saved = isSaved(job._id);
    const overview = [
        { icon: IndianRupee, label: "Salary", value: formatSalary(job.salary) },
        { icon: TrendingUp, label: "Experience", value: formatExperience(job.experienceLevel) },
        { icon: Briefcase, label: "Job type", value: job.jobType },
        { icon: MapPin, label: "Location", value: job.location },
        { icon: Users, label: "Openings", value: job.position },
        { icon: Users, label: "Total applicants", value: job.applicantsCount },
        { icon: CalendarDays, label: "Posted", value: formatDate(job.createdAt) },
    ];

    let action;
    if (isOwner) {
        action = <Button asChild><Link to={`/admin/jobs/${job._id}/applicants`}>View applicants</Link></Button>
    } else if (user?.role === 'recruiter') {
        action = null;
    } else if (job.hasApplied) {
        action = (
            <div className='flex items-center gap-3'>
                <StatusBadge status={job.applicationStatus} />
                <Button disabled className="disabled:opacity-100" variant="secondary"><CheckCircle2 className='mr-2 h-4 w-4 text-emerald-600' /> Applied</Button>
            </div>
        )
    } else if (!job.isOpen) {
        action = <Button disabled variant="secondary">Applications closed</Button>
    } else {
        action = (
            <Button onClick={applyJobHandler} disabled={applying} size="lg">
                {applying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {user ? 'Apply now' : 'Login to apply'}
            </Button>
        )
    }

    return (
        <div className='page py-8'>
            <button onClick={() => navigate(-1)} className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'>
                <ArrowLeft className='h-4 w-4' /> Back
            </button>

            <div className='surface mt-5 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between'>
                <div className='flex min-w-0 items-center gap-4'>
                    <CompanyLogo company={job.company} className="h-14 w-14 rounded-2xl" />
                    <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <h1 className='text-xl font-bold sm:text-2xl'>{job.title}</h1>
                            {!job.isOpen && <StatusBadge status="closed" />}
                        </div>
                        <p className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
                            <span className='font-medium text-foreground'>{job.company?.name}</span>
                            <span aria-hidden>·</span>
                            <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' />{job.location}</span>
                            <span aria-hidden>·</span>
                            <span>{timeAgo(job.createdAt)}</span>
                        </p>
                    </div>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                    {
                        canSave && (
                            <Button variant="outline" size="icon" onClick={() => toggleSaved(job._id)} aria-label={saved ? "Remove from saved jobs" : "Save job"} aria-pressed={saved} className={cn(saved && 'border-primary/40 text-primary')}>
                                <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                            </Button>
                        )
                    }
                    {action}
                </div>
            </div>

            <div className='mt-6 grid gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-2'>
                    <section className='surface p-6'>
                        <h2 className='font-semibold'>About the role</h2>
                        <p className='mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>{job.description}</p>
                    </section>
                    <section className='surface p-6'>
                        <h2 className='font-semibold'>Requirements</h2>
                        {
                            job.requirements?.length > 0 ? (
                                <div className='mt-3 flex flex-wrap gap-2'>
                                    {job.requirements.map((item) => <span key={item} className='rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground'>{item}</span>)}
                                </div>
                            ) : <p className='mt-3 text-sm text-muted-foreground'>No specific requirements listed.</p>
                        }
                    </section>
                </div>

                <aside className='space-y-6'>
                    <section className='surface p-6'>
                        <h2 className='font-semibold'>Job overview</h2>
                        <dl className='mt-4 space-y-3.5'>
                            {
                                overview.map((item) => (
                                    <div key={item.label} className='flex items-center justify-between gap-4 text-sm'>
                                        <dt className='flex items-center gap-2 text-muted-foreground'><item.icon className='h-4 w-4' />{item.label}</dt>
                                        <dd className='text-right font-medium'>{item.value}</dd>
                                    </div>
                                ))
                            }
                        </dl>
                    </section>
                    <section className='surface p-6'>
                        <h2 className='font-semibold'>About {job.company?.name}</h2>
                        <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>{job.company?.description || "This company has not added a description yet."}</p>
                        {job.company?.location && <p className='mt-3 flex items-center gap-1.5 text-sm text-muted-foreground'><MapPin className='h-3.5 w-3.5' />{job.company.location}</p>}
                        {
                            job.company?.website && (
                                <a href={job.company.website} target="_blank" rel="noopener noreferrer" className='mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'>
                                    Visit website <ExternalLink className='h-3.5 w-3.5' />
                                </a>
                            )
                        }
                    </section>
                </aside>
            </div>
        </div>
    )
}

export default JobDescription
