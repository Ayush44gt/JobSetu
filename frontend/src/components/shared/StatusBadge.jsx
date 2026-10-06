import { cn } from '@/lib/utils'

const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    open: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    closed: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
}

const StatusBadge = ({ status, className }) => {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', styles[status] || styles.closed, className)}>
            <span className='h-1.5 w-1.5 rounded-full bg-current' />
            {status}
        </span>
    )
}

export default StatusBadge
