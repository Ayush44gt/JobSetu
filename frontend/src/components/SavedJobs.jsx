import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Bookmark } from 'lucide-react'
import { JobGrid } from './Job'
import { EmptyState } from './shared/States'
import { Button } from './ui/button'
import useFetch from '@/hooks/useFetch'

const SavedJobs = () => {
    const { user } = useSelector(store => store.auth);
    const { data, loading, error, refetch } = useFetch("/user/saved");
    // a job disappears from this page as soon as it is unsaved
    const jobs = data?.jobs?.filter((job) => user?.savedJobs?.includes(job._id));

    return (
        <div className='page py-8'>
            <h1 className='text-2xl font-bold sm:text-3xl'>Saved jobs</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Roles you bookmarked to come back to.</p>
            <div className='mt-6'>
                <JobGrid
                    jobs={jobs}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                    skeletons={3}
                    empty={
                        <EmptyState
                            icon={Bookmark}
                            title="No saved jobs yet"
                            description="Tap the bookmark on any job to save it here for later."
                            action={<Button asChild><Link to="/jobs">Browse jobs</Link></Button>}
                        />
                    }
                />
            </div>
        </div>
    )
}

export default SavedJobs
