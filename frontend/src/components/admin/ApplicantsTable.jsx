import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, FileText, Loader2, MoreHorizontal, RotateCcw, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage, resumeUrl } from '@/lib/api';
import UserAvatar from '../shared/UserAvatar';
import StatusBadge from '../shared/StatusBadge';
import { EmptyState } from '../shared/States';
import { RowMenuItem } from './PageHeader';
import { formatDate } from '@/lib/format';

const actions = [
    { status: "accepted", label: "Accept", icon: Check },
    { status: "rejected", label: "Reject", icon: X },
    { status: "pending", label: "Move to pending", icon: RotateCcw },
];

const ApplicantsTable = ({ applications, total, onStatusChanged }) => {
    const [updatingId, setUpdatingId] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);

    const statusHandler = async (status, id) => {
        try {
            setUpdatingId(id);
            setOpenMenu(null);
            const res = await api.post(`/application/status/${id}/update`, { status });
            if (res.data.success) {
                onStatusChanged(id, res.data.application.status);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setUpdatingId(null);
        }
    }

    if (!applications.length) {
        return (
            <div className='p-6'>
                <EmptyState
                    className="border-0 py-8"
                    icon={Users}
                    title={total === 0 ? "No applicants yet" : "No applicants with this status"}
                    description={total === 0 ? "Applications will appear here as students apply." : "Choose another tab to see the rest."}
                />
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Résumé</TableHead>
                    <TableHead>Applied on</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    applications.map((item) => (
                        <TableRow key={item._id}>
                            <TableCell className="pl-6">
                                <div className='flex items-center gap-3'>
                                    <UserAvatar user={item.applicant} className="h-9 w-9" />
                                    <div className='min-w-0'>
                                        <span className='block whitespace-nowrap font-medium'>{item.applicant.fullname}</span>
                                        <span className='block text-xs text-muted-foreground'>{item.applicant.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{item.applicant.phoneNumber}</TableCell>
                            <TableCell>
                                {
                                    item.applicant.profile?.skills?.length > 0 ? (
                                        <div className='flex max-w-[220px] flex-wrap gap-1'>
                                            {item.applicant.profile.skills.slice(0, 3).map((skill) => <span key={skill} className='rounded-full bg-secondary px-2 py-0.5 text-xs'>{skill}</span>)}
                                            {item.applicant.profile.skills.length > 3 && <span className='px-1 text-xs text-muted-foreground'>+{item.applicant.profile.skills.length - 3}</span>}
                                        </div>
                                    ) : <span className='text-muted-foreground'>—</span>
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    item.applicant.profile?.resume
                                        ? <a className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-primary hover:underline" href={resumeUrl(item.applicant._id)} target="_blank" rel="noopener noreferrer"><FileText className='h-4 w-4' /> View</a>
                                        : <span className='text-muted-foreground'>Not uploaded</span>
                                }
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                            <TableCell><StatusBadge status={item.status} /></TableCell>
                            <TableCell className="pr-6 text-right">
                                {
                                    updatingId === item._id ? <Loader2 className='ml-auto mr-3 h-4 w-4 animate-spin text-muted-foreground' /> : (
                                        <Popover open={openMenu === item._id} onOpenChange={(open) => setOpenMenu(open ? item._id : null)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" aria-label={`Actions for ${item.applicant.fullname}`}><MoreHorizontal className='h-4 w-4' /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="w-48 rounded-xl p-1.5">
                                                {
                                                    actions.filter((action) => action.status !== item.status).map((action) => (
                                                        <RowMenuItem key={action.status} icon={action.icon} destructive={action.status === "rejected"} onClick={() => statusHandler(action.status, item._id)}>{action.label}</RowMenuItem>
                                                    ))
                                                }
                                            </PopoverContent>
                                        </Popover>
                                    )
                                }
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}

export default ApplicantsTable
