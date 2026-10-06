import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const Logo = ({ to = "/", className }) => {
    return (
        <Link to={to} className={cn('flex items-center gap-2', className)} aria-label="JobSetu home">
            <img src="/favicon.svg" alt="" className='h-8 w-8' />
            <span className='text-xl font-bold tracking-tight'>Job<span className='text-gradient'>Setu</span></span>
        </Link>
    )
}

export default Logo
