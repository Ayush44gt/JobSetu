import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/authSlice'
import { AuthShell, RolePicker } from './AuthShell'
import { SubmitButton } from '../shared/States'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "student",
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post("/user/login", input, { skipAuthRedirect: true });
            if (res.data.success) {
                toast.success(res.data.message);
                // GuestRoute sends the user on to where they were going
                dispatch(setUser(res.data.user));
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Login to continue to JobSetu."
            footer={<>Don&apos;t have an account? <Link to="/signup" className='font-medium text-primary hover:underline'>Sign up</Link></>}>
            <form onSubmit={submitHandler} className='grid gap-4'>
                <div className='grid gap-1.5'>
                    <Label>I am a</Label>
                    <RolePicker value={input.role} onChange={(role) => setInput({ ...input, role })} />
                </div>
                <div className='grid gap-1.5'>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required autoComplete="email" value={input.email} name="email" onChange={changeEventHandler} placeholder="you@example.com" />
                </div>
                <div className='grid gap-1.5'>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required autoComplete="current-password" value={input.password} name="password" onChange={changeEventHandler} placeholder="Your password" />
                </div>
                <SubmitButton loading={loading} className="mt-2 w-full">Login</SubmitButton>
            </form>
        </AuthShell>
    )
}

export default Login
