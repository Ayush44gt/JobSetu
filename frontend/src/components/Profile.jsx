import { useState } from 'react'
import { Button } from './ui/button'
import { FileText, Mail, Pencil, Phone } from 'lucide-react'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import UserAvatar from './shared/UserAvatar'
import { useSelector } from 'react-redux'
import useFetch from '@/hooks/useFetch'
import { resumeUrl } from '@/lib/api'
import { formatDate } from '@/lib/format'

const Profile = () => {
    const [open, setOpen] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const isStudent = user?.role === 'student';
    const { data, setData, loading, error, refetch } = useFetch(isStudent ? "/application/get" : null);
    const applications = data?.application || [];

    const count = (status) => applications.filter((application) => application.status === status).length;
    const stats = [
        { label: "Applied", value: applications.length },
        { label: "Pending", value: count("pending") },
        { label: "Accepted", value: count("accepted") },
        { label: "Rejected", value: count("rejected") },
    ];

    return (
        <div className='page max-w-4xl py-8'>
            <section className='surface p-6 sm:p-8'>
                <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='flex items-center gap-4'>
                        <UserAvatar user={user} className="h-20 w-20 text-lg" />
                        <div>
                            <h1 className='text-xl font-bold sm:text-2xl'>{user?.fullname}</h1>
                            <p className='mt-0.5 text-sm capitalize text-muted-foreground'>{user?.role} · Joined {formatDate(user?.createdAt)}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} variant="outline" className="shrink-0"><Pencil className='mr-2 h-4 w-4' /> Edit profile</Button>
                </div>

                <p className='mt-5 text-sm leading-relaxed text-muted-foreground'>{user?.profile?.bio || "No bio added yet."}</p>

                <div className='mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6'>
                    <span className='flex items-center gap-2'><Mail className='h-4 w-4 text-muted-foreground' />{user?.email}</span>
                    <span className='flex items-center gap-2'><Phone className='h-4 w-4 text-muted-foreground' />{user?.phoneNumber}</span>
                </div>

                {
                    isStudent && (
                        <div className='mt-6 grid gap-6 border-t pt-6 sm:grid-cols-2'>
                            <div>
                                <h2 className='text-sm font-semibold'>Skills</h2>
                                <div className='mt-2.5 flex flex-wrap gap-1.5'>
                                    {
                                        user?.profile?.skills?.length > 0
                                            ? user.profile.skills.map((item) => <span key={item} className='rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground'>{item}</span>)
                                            : <span className='text-sm text-muted-foreground'>No skills added yet.</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h2 className='text-sm font-semibold'>Résumé</h2>
                                <div className='mt-2.5'>
                                    {
                                        user?.profile?.resume
                                            ? <a target='_blank' rel="noopener noreferrer" href={resumeUrl(user._id)} className='inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary hover:bg-accent'><FileText className='h-4 w-4 shrink-0' /><span className='truncate'>{user.profile.resumeOriginalName || "View résumé"}</span></a>
                                            : <span className='text-sm text-muted-foreground'>No résumé uploaded yet.</span>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </section>

            {
                isStudent && (
                    <>
                        <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                            {
                                stats.map((stat) => (
                                    <div key={stat.label} className='surface p-4'>
                                        <p className='text-xs text-muted-foreground'>{stat.label}</p>
                                        <p className='mt-1 text-2xl font-bold'>{loading ? "—" : stat.value}</p>
                                    </div>
                                ))
                            }
                        </div>
                        <section className='surface mt-6 overflow-hidden'>
                            <h2 className='border-b px-6 py-4 font-semibold'>Applied jobs</h2>
                            <AppliedJobTable
                                applications={applications}
                                loading={loading}
                                error={error}
                                onRetry={refetch}
                                onWithdrawn={(id) => setData({ ...data, application: applications.filter((application) => application._id !== id) })}
                            />
                        </section>
                    </>
                )
            }
            <UpdateProfileDialog open={open} setOpen={setOpen}/>
        </div>
    )
}

export default Profile
