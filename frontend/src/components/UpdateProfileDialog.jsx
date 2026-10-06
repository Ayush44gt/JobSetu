import  { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import api, { getErrorMessage } from '@/lib/api'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { SubmitButton } from './shared/States'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const isStudent = user?.role === 'student';

    const initialInput = () => ({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(", ") || "",
        file: null,
        profilePhoto: null
    });
    const [input, setInput] = useState(initialInput);
    const dispatch = useDispatch();

    // start from the saved profile every time the dialog opens
    useEffect(() => {
        if (open) setInput(initialInput());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.files?.[0] || null })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        if (isStudent) formData.append("skills", input.skills);
        if (input.file) formData.append("file", input.file);
        if (input.profilePhoto) formData.append("profilePhoto", input.profilePhoto);
        try {
            setLoading(true);
            const res = await api.post("/user/profile/update", formData);
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally{
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update profile</DialogTitle>
                    <DialogDescription>Recruiters see this information when you apply.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <div className='grid gap-4 py-2'>
                        <div className='grid gap-1.5'>
                            <Label htmlFor="fullname">Full name</Label>
                            <Input id="fullname" name="fullname" type="text" required value={input.fullname} onChange={changeEventHandler} />
                        </div>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required value={input.email} onChange={changeEventHandler} />
                            </div>
                            <div className='grid gap-1.5'>
                                <Label htmlFor="phoneNumber">Phone number</Label>
                                <Input id="phoneNumber" name="phoneNumber" type="tel" required value={input.phoneNumber} onChange={changeEventHandler} />
                            </div>
                        </div>
                        <div className='grid gap-1.5'>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" name="bio" maxLength={400} className="min-h-[84px]" placeholder="A line or two about you" value={input.bio} onChange={changeEventHandler} />
                        </div>
                        {
                            isStudent && (
                                <div className='grid gap-1.5'>
                                    <Label htmlFor="skills">Skills</Label>
                                    <Input id="skills" name="skills" placeholder="React, Node.js, SQL" value={input.skills} onChange={changeEventHandler} />
                                    <p className='text-xs text-muted-foreground'>Separate skills with commas.</p>
                                </div>
                            )
                        }
                        <div className='grid gap-1.5'>
                            <Label htmlFor="profilePhoto">Profile photo</Label>
                            <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={fileChangeHandler} className="cursor-pointer" />
                        </div>
                        {
                            isStudent && (
                                <div className='grid gap-1.5'>
                                    <Label htmlFor="file">Résumé (PDF, up to 5 MB)</Label>
                                    <Input id="file" name="file" type="file" accept="application/pdf" onChange={fileChangeHandler} className="cursor-pointer" />
                                    {user?.profile?.resumeOriginalName && <p className='text-xs text-muted-foreground'>Current: {user.profile.resumeOriginalName}. Choose a file only to replace it.</p>}
                                </div>
                            )
                        }
                    </div>
                    <DialogFooter className="mt-4 gap-2 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <SubmitButton loading={loading}>Save changes</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateProfileDialog
