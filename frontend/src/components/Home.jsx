import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, FileCheck2, Search, Sparkles, UserPlus } from 'lucide-react'
import LatestJobs from './LatestJobs'
import { Button } from './ui/button'
import useFetch from '@/hooks/useFetch'

const categories = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer",
    "Internship",
]

const steps = [
    { icon: UserPlus, title: "Create your profile", text: "Sign up in a minute, add your skills and upload your résumé." },
    { icon: Search, title: "Find the right role", text: "Search and filter by location, job type, salary and experience." },
    { icon: FileCheck2, title: "Apply and track", text: "Apply in one click and follow each application's status." },
]

const Home = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const { data } = useFetch("/job/meta");

    // recruiters work from their dashboard, not the student landing page
    if (user?.role === 'recruiter') return <Navigate to="/admin/jobs" replace />

    const searchJobHandler = (e) => {
        e.preventDefault();
        navigate(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : "/jobs");
    }

    const stats = [
        { label: "Open jobs", value: data?.stats?.jobs },
        { label: "Companies hiring", value: data?.stats?.companies },
        { label: "Students", value: data?.stats?.students },
    ];

    return (
        <div>
            <section className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(252_90%_94%)_0%,transparent_100%)]' />
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className='page flex flex-col items-center py-16 text-center sm:py-24'>
                    <span className='inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-accent-foreground shadow-sm'>
                        <Sparkles className='h-3.5 w-3.5 text-primary' /> The campus job portal
                    </span>
                    <h1 className='mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl'>
                        Search, apply and get your <span className='text-gradient'>dream job</span>
                    </h1>
                    <p className='mt-5 max-w-xl text-base text-muted-foreground sm:text-lg'>
                        JobSetu connects students with internships and jobs shared directly by recruiters.
                    </p>

                    <form onSubmit={searchJobHandler} className='mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border bg-card p-1.5 pl-5 shadow-lg shadow-primary/5 focus-within:ring-2 focus-within:ring-ring'>
                        <Search className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <input
                            type="text"
                            value={query}
                            placeholder='Job title, skill or company'
                            aria-label="Search jobs"
                            onChange={(e) => setQuery(e.target.value)}
                            className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                        />
                        <Button type="submit" className="rounded-full px-6">Search</Button>
                    </form>

                    <div className='mt-6 flex flex-wrap items-center justify-center gap-2'>
                        <span className='text-xs text-muted-foreground'>Popular:</span>
                        {
                            categories.map((cat) => (
                                <Link key={cat} to={`/jobs?q=${encodeURIComponent(cat)}`} className='rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary'>{cat}</Link>
                            ))
                        }
                    </div>

                    <dl className='mt-12 grid w-full max-w-2xl grid-cols-3 divide-x rounded-2xl border bg-card py-5 shadow-sm'>
                        {
                            stats.map((stat) => (
                                <div key={stat.label} className='px-2'>
                                    <dd className='text-2xl font-bold sm:text-3xl'>{stat.value ?? "—"}</dd>
                                    <dt className='mt-1 text-xs text-muted-foreground sm:text-sm'>{stat.label}</dt>
                                </div>
                            ))
                        }
                    </dl>
                </motion.div>
            </section>

            <LatestJobs />

            <section className='page py-8'>
                <h2 className='text-center text-2xl font-bold sm:text-3xl'>How it works</h2>
                <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {
                        steps.map((step, index) => (
                            <div key={step.title} className='surface p-6'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary'>
                                    <step.icon className='h-5 w-5' />
                                </div>
                                <p className='mt-4 text-xs font-medium text-muted-foreground'>Step {index + 1}</p>
                                <h3 className='mt-1 font-semibold'>{step.title}</h3>
                                <p className='mt-1.5 text-sm text-muted-foreground'>{step.text}</p>
                            </div>
                        ))
                    }
                </div>
            </section>

            {
                !user && (
                    <section className='page pt-12'>
                        <div className='flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white sm:p-10 md:flex-row md:items-center'>
                            <div>
                                <div className='flex items-center gap-2 text-sm font-medium text-white/80'><Building2 className='h-4 w-4' /> For recruiters</div>
                                <h2 className='mt-2 text-2xl font-bold sm:text-3xl'>Hiring from campus?</h2>
                                <p className='mt-2 max-w-md text-sm text-white/80'>Register your company, post roles and review applicants in one place.</p>
                            </div>
                            <Button asChild size="lg" variant="secondary" className="rounded-full">
                                <Link to="/signup">Post a job <ArrowRight className='ml-2 h-4 w-4' /></Link>
                            </Button>
                        </div>
                    </section>
                )
            }
        </div>
    )
}

export default Home
