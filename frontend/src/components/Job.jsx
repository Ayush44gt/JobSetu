import { Bookmark, Briefcase, Clock, IndianRupee, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompanyLogo from './shared/CompanyLogo'
import { ErrorState } from './shared/States'
import { Skeleton } from './ui/skeleton'
import { formatExperience, formatSalary, timeAgo } from '@/lib/format'
import useSavedJobs from '@/hooks/useSavedJobs'
import { cn } from '@/lib/utils'

const Job = ({job}) => {
    const { canSave, isSaved, toggleSaved } = useSavedJobs();
    const saved = isSaved(job?._id);

    return (
        <article className='surface group relative flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'>
            <div className='flex items-start justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-3'>
                    <CompanyLogo company={job?.company} />
                    <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>{job?.company?.name}</p>
                        <p className='flex items-center gap-1 truncate text-xs text-muted-foreground'><MapPin className='h-3 w-3 shrink-0' />{job?.location}</p>
                    </div>
                </div>
                {
                    canSave && (
                        <button
                            onClick={() => toggleSaved(job._id)}
                            aria-label={saved ? "Remove from saved jobs" : "Save job"}
                            aria-pressed={saved}
                            className={cn('relative z-10 rounded-full p-2 transition hover:bg-accent', saved ? 'text-primary' : 'text-muted-foreground')}>
                            <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                        </button>
                    )
                }
            </div>

            <h3 className='mt-4 text-base font-semibold leading-snug'>
                <Link to={`/description/${job?._id}`} className='after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none'>{job?.title}</Link>
            </h3>
            <p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>{job?.description}</p>

            <div className='mt-4 flex flex-wrap gap-1.5'>
                <span className='inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground'><Briefcase className='h-3 w-3' />{job?.jobType}</span>
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'><IndianRupee className='h-3 w-3' />{formatSalary(job?.salary).replace("₹", "")}</span>
                <span className='inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'>{formatExperience(job?.experienceLevel)}</span>
            </div>

            <div className='mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1'><Clock className='h-3 w-3' />{timeAgo(job?.createdAt)}</span>
                <span>{job?.position} {job?.position === 1 ? 'opening' : 'openings'}</span>
            </div>
        </article>
    )
}

export const JobSkeleton = () => {
    return (
        <div className='surface p-5'>
            <div className='flex items-center gap-3'>
                <Skeleton className='h-11 w-11 rounded-xl' />
                <div className='space-y-2'>
                    <Skeleton className='h-3.5 w-28' />
                    <Skeleton className='h-3 w-20' />
                </div>
            </div>
            <Skeleton className='mt-5 h-4 w-3/4' />
            <Skeleton className='mt-3 h-3 w-full' />
            <Skeleton className='mt-2 h-3 w-5/6' />
            <div className='mt-5 flex gap-2'>
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-6 w-16 rounded-full' />
            </div>
        </div>
    )
}

// the grid every job listing uses, with loading, error and empty handling
export const JobGrid = ({ jobs, loading, error, onRetry, empty, columns = "sm:grid-cols-2 lg:grid-cols-3", skeletons = 6 }) => {
    if (loading) {
        return (
            <div className={cn('grid grid-cols-1 gap-4', columns)}>
                {Array.from({ length: skeletons }).map((_, index) => <JobSkeleton key={index} />)}
            </div>
        )
    }
    if (error) return <ErrorState message={error} onRetry={onRetry} />
    if (!jobs?.length) return empty;
    return (
        <div className={cn('grid grid-cols-1 gap-4', columns)}>
            {jobs.map((job) => <Job key={job._id} job={job} />)}
        </div>
    )
}

export default Job
