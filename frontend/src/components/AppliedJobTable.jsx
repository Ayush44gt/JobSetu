import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import CompanyLogo from './shared/CompanyLogo'
import StatusBadge from './shared/StatusBadge'
import ConfirmDialog from './shared/ConfirmDialog'
import { EmptyState, ErrorState } from './shared/States'
import api, { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'

const AppliedJobTable = ({ applications, loading, error, onRetry, onWithdrawn }) => {
    const [target, setTarget] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);

    const withdrawHandler = async () => {
        try {
            setWithdrawing(true);
            const res = await api.delete(`/application/withdraw/${target._id}`);
            toast.success(res.data.message);
            onWithdrawn(target._id);
            setTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setWithdrawing(false);
        }
    }

    if (loading) {
        return <div className='space-y-3 p-6'>{[1, 2, 3].map((item) => <Skeleton key={item} className='h-12 w-full' />)}</div>
    }
    if (error) return <div className='p-6'><ErrorState message={error} onRetry={onRetry} /></div>
    if (!applications?.length) {
        return (
            <div className='p-6'>
                <EmptyState
                    className="border-0 py-8"
                    icon={FileSearch}
                    title="You haven't applied to any job yet"
                    description="When you apply, the application and its status will show up here."
                    action={<Button asChild><Link to="/jobs">Browse jobs</Link></Button>}
                />
            </div>
        )
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6">Job role</TableHead>
                        <TableHead>Applied on</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-6 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applications.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell className="pl-6">
                                    {
                                        appliedJob.job ? (
                                            <Link to={`/description/${appliedJob.job._id}`} className='flex items-center gap-3 hover:underline'>
                                                <CompanyLogo company={appliedJob.job.company} className="h-9 w-9 rounded-lg" />
                                                <span>
                                                    <span className='block font-medium'>{appliedJob.job.title}</span>
                                                    <span className='block text-xs text-muted-foreground'>{appliedJob.job.company?.name}</span>
                                                </span>
                                            </Link>
                                        ) : <span className='text-muted-foreground'>This job was removed</span>
                                    }
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(appliedJob.createdAt)}</TableCell>
                                <TableCell><StatusBadge status={appliedJob.status} /></TableCell>
                                <TableCell className="pr-6 text-right">
                                    {
                                        appliedJob.status === 'pending'
                                            ? <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setTarget(appliedJob)}>Withdraw</Button>
                                            : <span className='text-xs text-muted-foreground'>—</span>
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <ConfirmDialog
                open={Boolean(target)}
                onOpenChange={(open) => !open && setTarget(null)}
                title="Withdraw this application?"
                description={`Your application for ${target?.job?.title || "this job"} will be removed. You can apply again while the job is open.`}
                confirmLabel="Withdraw"
                loading={withdrawing}
                onConfirm={withdrawHandler}
            />
        </div>
    )
}

export default AppliedJobTable
