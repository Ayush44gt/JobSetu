import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { AuthShell, RolePicker } from './AuthShell'
import { SubmitButton } from '../shared/States'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "student",
        file: null
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] || null });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        if (input.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        const formData = new FormData();    //formdata object
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await api.post("/user/register", formData, { skipAuthRedirect: true });
            if (res.data.success) {
                navigate("/login");
                toast.success(`${res.data.message} Please login.`);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally{
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Join JobSetu as a student or a recruiter."
            footer={<>Already have an account? <Link to="/login" className='font-medium text-primary hover:underline'>Login</Link></>}>
            <form onSubmit={submitHandler} className='grid gap-4'>
                <div className='grid gap-1.5'>
                    <Label>I am a</Label>
                    <RolePicker value={input.role} onChange={(role) => setInput({ ...input, role })} />
                </div>
                <div className='grid gap-1.5'>
                    <Label htmlFor="fullname">Full name</Label>
                    <Input id="fullname" type="text" required autoComplete="name" value={input.fullname} name="fullname" onChange={changeEventHandler} placeholder="Aarav Sharma" />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='grid gap-1.5'>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required autoComplete="email" value={input.email} name="email" onChange={changeEventHandler} placeholder="you@example.com" />
                    </div>
                    <div className='grid gap-1.5'>
                        <Label htmlFor="phoneNumber">Phone number</Label>
                        <Input id="phoneNumber" type="tel" required autoComplete="tel" value={input.phoneNumber} name="phoneNumber" onChange={changeEventHandler} placeholder="9876543210" />
                    </div>
                </div>
                <div className='grid gap-1.5'>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required minLength={6} autoComplete="new-password" value={input.password} name="password" onChange={changeEventHandler} placeholder="At least 6 characters" />
                </div>
                <div className='grid gap-1.5'>
                    <Label htmlFor="file">Profile photo <span className='font-normal text-muted-foreground'>(optional)</span></Label>
                    <Input id="file" accept="image/*" type="file" onChange={changeFileHandler} className="cursor-pointer" />
                </div>
                <SubmitButton loading={loading} className="mt-2 w-full">Create account</SubmitButton>
            </form>
        </AuthShell>
    )
}

export default Signup
