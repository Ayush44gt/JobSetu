import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import api, { getErrorMessage } from '@/lib/api'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useFetch from '@/hooks/useFetch'
import PageHeader from './PageHeader'
import CompanyLogo from '../shared/CompanyLogo'
import { ErrorState, PageLoader, SubmitButton } from '../shared/States'

const CompanySetup = () => {
    const params = useParams();
    const { data, loading: fetching, error, refetch } = useFetch(`/company/get/${params.id}`);
    const singleCompany = data?.company;
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0] || null;
        setInput({ ...input, file });
        setPreview(file ? URL.createObjectURL(file) : "");
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await api.put(`/company/update/${params.id}`, formData);
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!singleCompany) return;
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: null
        })
    },[singleCompany]);

    if (fetching) return <PageLoader />
    if (error) return <div className='page py-10'><ErrorState message={error} onRetry={refetch} /></div>

    return (
        <div className='page max-w-2xl py-8'>
            <PageHeader backTo="/admin/companies" backLabel="Companies" title="Company setup" description="This is what students see on your job posts." />
            <form onSubmit={submitHandler} className='surface mt-6 p-6'>
                <div className='flex items-center gap-4'>
                    <CompanyLogo company={{ name: input.name, logo: preview || singleCompany?.logo }} className="h-16 w-16 rounded-2xl" />
                    <div className='grid flex-1 gap-1.5'>
                        <Label htmlFor="logo">Logo</Label>
                        <Input id="logo" type="file" accept="image/*" onChange={changeFileHandler} className="cursor-pointer" />
                    </div>
                </div>
                <div className='mt-5 grid gap-4 sm:grid-cols-2'>
                    <div className='grid gap-1.5'>
                        <Label htmlFor="name">Company name</Label>
                        <Input id="name" type="text" name="name" required value={input.name} onChange={changeEventHandler} />
                    </div>
                    <div className='grid gap-1.5'>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" type="text" name="location" placeholder="Bengaluru" value={input.location} onChange={changeEventHandler} />
                    </div>
                    <div className='grid gap-1.5 sm:col-span-2'>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" type="url" name="website" placeholder="https://example.com" value={input.website} onChange={changeEventHandler} />
                    </div>
                    <div className='grid gap-1.5 sm:col-span-2'>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="What does the company do?" value={input.description} onChange={changeEventHandler} />
                    </div>
                </div>
                <div className='mt-6 flex items-center justify-end gap-2'>
                    <Button type="button" variant="outline" asChild><Link to="/admin/companies">Cancel</Link></Button>
                    <SubmitButton loading={loading}>Save company</SubmitButton>
                </div>
            </form>
        </div>
    )
}

export default CompanySetup
