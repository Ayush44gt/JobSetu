import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase } from 'lucide-react'
import { JobGrid } from './Job'
import { EmptyState } from './shared/States'
import useFetch from '@/hooks/useFetch'

const LatestJobs = () => {
    const { data, loading, error, refetch } = useFetch("/job/get");

    return (
        <section className='page py-16'>
            <div className='mb-8 flex items-end justify-between gap-4'>
                <div>
                    <h2 className='text-2xl font-bold sm:text-3xl'><span className='text-gradient'>Latest</span> job openings</h2>
                    <p className='mt-1 text-sm text-muted-foreground'>Fresh roles posted by recruiters this week.</p>
                </div>
                <Link to="/jobs" className='hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex'>View all <ArrowRight className='h-4 w-4' /></Link>
            </div>
            <JobGrid
                jobs={data?.jobs?.slice(0, 6)}
                loading={loading}
                error={error}
                onRetry={refetch}
                empty={<EmptyState icon={Briefcase} title="No jobs posted yet" description="New openings will show up here as soon as recruiters post them." />}
            />
        </section>
    )
}

export default LatestJobs
