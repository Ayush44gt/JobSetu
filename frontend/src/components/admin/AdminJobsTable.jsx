import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Briefcase, Edit2, Eye, Lock, MoreHorizontal, Trash2, Unlock, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CompanyLogo from '../shared/CompanyLogo'
import StatusBadge from '../shared/StatusBadge'
import ConfirmDialog from '../shared/ConfirmDialog'
import { EmptyState, ErrorState } from '../shared/States'
import { RowMenuItem, TableSkeleton } from './PageHeader'
import api, { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'

const AdminJobsTable = ({ jobs, search, loading, error, onRetry, onDeleted, onStatusChanged }) => { 
    const navigate = useNavigate();
    const [target, setTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const deleteHandler = async () => {
        try {
            setDeleting(true);
            const res = await api.delete(`/job/delete/${target._id}`);
            toast.success(res.data.message);
            onDeleted(target._id);
            setTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    const toggleStatus = async (job) => {
        try {
            const res = await api.patch(`/job/status/${job._id}`);
            toast.success(res.data.message);
            onStatusChanged(job._id, res.data.job.isOpen);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    if (loading) return <TableSkeleton />
    if (error) return <div className='p-6'><ErrorState message={error} onRetry={onRetry} /></div>
    if (!jobs?.length) {
        return (
            <div className='p-6'>
                <EmptyState
                    className="border-0 py-8"
                    icon={Briefcase}
                    title="No jobs posted yet"
                    description="Post your first role to start receiving applications."
                    action={<Button asChild><Link to="/admin/jobs/create">Post a job</Link></Button>}
                />
            </div>
        )
    }

    const filterJobs = jobs.filter((job)=>{
        if(!search) return true;
        return job?.title?.toLowerCase().includes(search.toLowerCase()) || job?.company?.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6">Role</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="pr-6 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No job matches “{search}”.</TableCell>
                            </TableRow>
                        )
                    }
                    {
                        filterJobs.map((job) => (
                            <TableRow key={job._id}>
                                <TableCell className="pl-6">
                                    <div className='flex items-center gap-3'>
                                        <CompanyLogo company={job.company} className="h-9 w-9 rounded-lg" />
                                        <div className='min-w-0'>
                                            <Link to={`/admin/jobs/${job._id}/applicants`} className='block font-medium hover:underline'>{job.title}</Link>
                                            <span className='block text-xs text-muted-foreground'>{job.company?.name} · {job.location}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{job.jobType}</TableCell>
                                <TableCell>
                                    <Link to={`/admin/jobs/${job._id}/applicants`} className='inline-flex items-center gap-1.5 font-medium hover:underline'>
                                        <Users className='h-3.5 w-3.5 text-muted-foreground' />{job.applicantsCount}
                                        {job.pendingCount > 0 && <span className='rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700'>{job.pendingCount} new</span>}
                                    </Link>
                                </TableCell>
                                <TableCell><StatusBadge status={job.isOpen ? "open" : "closed"} /></TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Popover open={openMenu === job._id} onOpenChange={(open) => setOpenMenu(open ? job._id : null)}>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label={`Actions for ${job.title}`}><MoreHorizontal className='h-4 w-4' /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-48 rounded-xl p-1.5">
                                            <RowMenuItem icon={Eye} onClick={()=> navigate(`/admin/jobs/${job._id}/applicants`)}>Applicants</RowMenuItem>
                                            <RowMenuItem icon={Edit2} onClick={()=> navigate(`/admin/jobs/${job._id}/edit`)}>Edit</RowMenuItem>
                                            <RowMenuItem icon={job.isOpen ? Lock : Unlock} onClick={() => { setOpenMenu(null); toggleStatus(job); }}>{job.isOpen ? "Close job" : "Reopen job"}</RowMenuItem>
                                            <RowMenuItem icon={Trash2} destructive onClick={() => { setOpenMenu(null); setTarget(job); }}>Delete</RowMenuItem>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <ConfirmDialog
                open={Boolean(target)}
                onOpenChange={(open) => !open && setTarget(null)}
                title={`Delete “${target?.title}”?`}
                description={target?.applicantsCount > 0
                    ? `This also deletes its ${target.applicantsCount} ${target.applicantsCount === 1 ? "application" : "applications"}. This cannot be undone.`
                    : "This cannot be undone."}
                loading={deleting}
                onConfirm={deleteHandler}
            />
        </div>
    )
}

export default AdminJobsTable
