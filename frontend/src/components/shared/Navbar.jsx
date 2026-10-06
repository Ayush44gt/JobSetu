import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Bookmark, LogOut, Menu, User2, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api, { getErrorMessage } from '@/lib/api'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import Logo from './Logo'
import UserAvatar from './UserAvatar'
import { cn } from '@/lib/utils'

const studentLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/jobs", label: "Jobs" },
    { to: "/saved", label: "Saved", auth: true },
];
const recruiterLinks = [
    { to: "/admin/jobs", label: "Jobs" },
    { to: "/admin/companies", label: "Companies" },
];

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const isRecruiter = user?.role === 'recruiter';
    const links = (isRecruiter ? recruiterLinks : studentLinks).filter((link) => !link.auth || user);

    const logoutHandler = async () => {
        try {
            const res = await api.get("/user/logout");
            if (res.data.success) {
                dispatch(setUser(null));
                setPopoverOpen(false);
                setMenuOpen(false);
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    const linkClass = ({ isActive }) => cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
    );

    return (
        <header className='sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md'>
            <div className='page flex h-16 items-center justify-between'>
                <Logo to={isRecruiter ? "/admin/jobs" : "/"} />

                <nav className='hidden items-center gap-1 md:flex'>
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>{link.label}</NavLink>
                    ))}
                </nav>

                <div className='flex items-center gap-2'>
                    {
                        !user ? (
                            <div className='hidden items-center gap-2 md:flex'>
                                <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
                                <Button asChild><Link to="/signup">Sign up</Link></Button>
                            </div>
                        ) : (
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button className='rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' aria-label="Account menu">
                                        <UserAvatar user={user} className="h-9 w-9" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-72 rounded-2xl p-2">
                                    <div className='flex items-center gap-3 p-2'>
                                        <UserAvatar user={user} className="h-10 w-10" />
                                        <div className='min-w-0'>
                                            <h4 className='truncate text-sm font-semibold'>{user?.fullname}</h4>
                                            <p className='truncate text-xs text-muted-foreground'>{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className='my-1 h-px bg-border' />
                                    <Link to="/profile" onClick={() => setPopoverOpen(false)} className='flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-secondary'>
                                        <User2 className='h-4 w-4 text-muted-foreground' /> View profile
                                    </Link>
                                    {
                                        !isRecruiter && (
                                            <Link to="/saved" onClick={() => setPopoverOpen(false)} className='flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-secondary'>
                                                <Bookmark className='h-4 w-4 text-muted-foreground' /> Saved jobs
                                            </Link>
                                        )
                                    }
                                    <button onClick={logoutHandler} className='flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-rose-600 hover:bg-rose-50'>
                                        <LogOut className='h-4 w-4' /> Logout
                                    </button>
                                </PopoverContent>
                            </Popover>
                        )
                    }
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                        {menuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                    </Button>
                </div>
            </div>

            {
                menuOpen && (
                    <div className='border-t bg-background md:hidden'>
                        <nav className='page flex flex-col gap-1 py-3'>
                            {links.map((link) => (
                                <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={linkClass}>{link.label}</NavLink>
                            ))}
                            {
                                !user && (
                                    <div className='mt-2 grid grid-cols-2 gap-2'>
                                        <Button variant="outline" asChild><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></Button>
                                        <Button asChild><Link to="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link></Button>
                                    </div>
                                )
                            }
                        </nav>
                    </div>
                )
            }
        </header>
    )
}

export default Navbar
