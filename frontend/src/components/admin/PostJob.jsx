import { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import api, { getErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
import PageHeader from './PageHeader'
import { EmptyState, ErrorState, PageLoader, SubmitButton } from '../shared/States'

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

// one form for both posting a new job and editing an existing one
const PostJob = () => {
    const params = useParams();
    const jobId = params.id;
    const isEdit = Boolean(jobId);

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: "1",
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const companiesQuery = useFetch("/company/get");
    const jobQuery = useFetch(isEdit ? `/job/get/${jobId}` : null);
    const companies = companiesQuery.data?.companies || [];
    const job = jobQuery.data?.job;

    useEffect(() => {
        if (!job) return;
        setInput({
            title: job.title || "",
            description: job.description || "",
            requirements: job.requirements?.join(", ") || "",
            salary: String(job.salary ?? ""),
            location: job.location || "",
            jobType: job.jobType || "",
            experience: String(job.experienceLevel ?? ""),
            position: String(job.position ?? "1"),
            companyId: job.company?._id || ""
        });
    }, [job]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.companyId) return toast.error("Please select a company.");
        if (!input.jobType) return toast.error("Please select a job type.");
        try {
            setLoading(true);
            const res = isEdit
                ? await api.put(`/job/update/${jobId}`, input)
                : await api.post("/job/post", input);
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally{
            setLoading(false);
        }
    }

    if (companiesQuery.loading || jobQuery.loading) return <PageLoader />
    if (companiesQuery.error || jobQuery.error) {
        return <div className='page py-10'><ErrorState message={companiesQuery.error || jobQuery.error} onRetry={() => { companiesQuery.refetch(); jobQuery.refetch(); }} /></div>
    }

    return (
        <div className='page max-w-3xl py-8'>
            <PageHeader
                backTo="/admin/jobs"
                backLabel="Jobs"
                title={isEdit ? "Edit job" : "Post a job"}
                description={isEdit ? "Changes are visible to students immediately." : "Describe the role. Students can apply as soon as you post it."}
            />
            {
                companies.length === 0 ? (
                    <EmptyState
                        className="mt-6"
                        icon={Building2}
                        title="Register a company first"
                        description="Every job is posted under a company. Register yours, then come back to post the role."
                        action={<Button asChild><Link to="/admin/companies/create">Register a company</Link></Button>}
                    />
                ) : (
                    <form onSubmit={submitHandler} className='surface mt-6 p-6'>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='grid gap-1.5 sm:col-span-2'>
                                <Label htmlFor="title">Job title</Label>
                                <Input id="title" type="text" name="title" required placeholder="Frontend Developer" value={input.title} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="companyId">Company</Label>
                                <Select value={input.companyId} onValueChange={(value) => setInput({ ...input, companyId: value })}>
                                    <SelectTrigger id="companyId">
                                        <SelectValue placeholder="Select a company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="jobType">Job type</Label>
                                <Select value={input.jobType} onValueChange={(value) => setInput({ ...input, jobType: value })}>
                                    <SelectTrigger id="jobType">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {jobTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" type="text" name="location" required placeholder="Bengaluru or Remote" value={input.location} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="salary">Salary (LPA)</Label>
                                <Input id="salary" type="number" name="salary" required min="0" step="0.1" placeholder="12" value={input.salary} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="experience">Minimum experience (years)</Label>
                                <Input id="experience" type="number" name="experience" required min="0" step="0.5" placeholder="0 for freshers" value={input.experience} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="position">Number of openings</Label>
                                <Input id="position" type="number" name="position" required min="1" step="1" value={input.position} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5 sm:col-span-2'>
                                <Label htmlFor="requirements">Requirements</Label>
                                <Input id="requirements" type="text" name="requirements" placeholder="React, JavaScript, Tailwind CSS" value={input.requirements} onChange={changeEventHandler} />
                                <p className='text-xs text-muted-foreground'>Separate skills with commas.</p>
                            </div>
                            <div className='grid gap-1.5 sm:col-span-2'>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required className="min-h-[160px]" placeholder="What will this person do? What does the team look like?" value={input.description} onChange={changeEventHandler} />
                            </div>
                        </div>
                        <div className='mt-6 flex items-center justify-end gap-2'>
                            <Button type="button" variant="outline" asChild><Link to="/admin/jobs">Cancel</Link></Button>
                            <SubmitButton loading={loading}>{isEdit ? "Save changes" : "Post job"}</SubmitButton>
                        </div>
                    </form>
                )
            }
        </div>
    )
}

export default PostJob
