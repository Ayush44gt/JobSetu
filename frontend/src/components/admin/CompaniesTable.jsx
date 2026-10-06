import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Building2, Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CompanyLogo from '../shared/CompanyLogo'
import ConfirmDialog from '../shared/ConfirmDialog'
import { EmptyState, ErrorState } from '../shared/States'
import { RowMenuItem, TableSkeleton } from './PageHeader'
import api, { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'

const CompaniesTable = ({ companies, search, loading, error, onRetry, onDeleted }) => {
    const navigate = useNavigate();
    const [target, setTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const deleteHandler = async () => {
        try {
            setDeleting(true);
            const res = await api.delete(`/company/delete/${target._id}`);
            toast.success(res.data.message);
            onDeleted(target._id);
            setTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    if (loading) return <TableSkeleton />
    if (error) return <div className='p-6'><ErrorState message={error} onRetry={onRetry} /></div>
    if (!companies?.length) {
        return (
            <div className='p-6'>
                <EmptyState
                    className="border-0 py-8"
                    icon={Building2}
                    title="No companies yet"
                    description="Register your company first. You can then post jobs under it."
                    action={<Button asChild><Link to="/admin/companies/create">Register a company</Link></Button>}
                />
            </div>
        )
    }

    const filterCompany = companies.filter((company) => {
        if(!search) return true;
        return company?.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6">Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Jobs</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="pr-6 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No company matches “{search}”.</TableCell>
                            </TableRow>
                        )
                    }
                    {
                        filterCompany.map((company) => (
                            <TableRow key={company._id}>
                                <TableCell className="pl-6">
                                    <div className='flex items-center gap-3'>
                                        <CompanyLogo company={company} className="h-9 w-9 rounded-lg" />
                                        <span className='font-medium'>{company.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{company.location || "—"}</TableCell>
                                <TableCell className="text-muted-foreground">{company.jobsCount}</TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Popover open={openMenu === company._id} onOpenChange={(open) => setOpenMenu(open ? company._id : null)}>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label={`Actions for ${company.name}`}><MoreHorizontal className='h-4 w-4' /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-40 rounded-xl p-1.5">
                                            <RowMenuItem icon={Edit2} onClick={()=> navigate(`/admin/companies/${company._id}`)}>Edit</RowMenuItem>
                                            <RowMenuItem icon={Trash2} destructive onClick={() => { setOpenMenu(null); setTarget(company); }}>Delete</RowMenuItem>
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
                title={`Delete ${target?.name}?`}
                description={target?.jobsCount > 0
                    ? `This also deletes its ${target.jobsCount} ${target.jobsCount === 1 ? "job" : "jobs"} and every application to them. This cannot be undone.`
                    : "This cannot be undone."}
                loading={deleting}
                onConfirm={deleteHandler}
            />
        </div>
    )
}

export default CompaniesTable
