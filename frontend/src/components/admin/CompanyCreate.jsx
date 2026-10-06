import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import PageHeader from './PageHeader'
import { SubmitButton } from '../shared/States'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);

    const registerNewCompany = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post("/company/register", {companyName});
            if(res?.data?.success){
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='page max-w-2xl py-8'>
            <PageHeader
                backTo="/admin/companies"
                backLabel="Companies"
                title="Register a company"
                description="Start with the name. You can add the logo, website and description next."
            />
            <form onSubmit={registerNewCompany} className='surface mt-6 p-6'>
                <div className='grid gap-1.5'>
                    <Label htmlFor="companyName">Company name</Label>
                    <Input
                        id="companyName"
                        type="text"
                        required
                        autoFocus
                        value={companyName}
                        placeholder="Microsoft, Zomato, etc."
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>
                <div className='mt-6 flex items-center justify-end gap-2'>
                    <Button type="button" variant="outline" asChild><Link to="/admin/companies">Cancel</Link></Button>
                    <SubmitButton loading={loading}>Continue</SubmitButton>
                </div>
            </form>
        </div>
    )
}

export default CompanyCreate
