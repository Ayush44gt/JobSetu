import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// title row used at the top of every recruiter page
const PageHeader = ({ title, description, backTo, backLabel = "Back", action }) => {
    return (
        <div>
            {
                backTo && (
                    <Link to={backTo} className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'>
                        <ArrowLeft className='h-4 w-4' /> {backLabel}
                    </Link>
                )
            }
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                <div className='min-w-0'>
                    <h1 className='text-2xl font-bold sm:text-3xl'>{title}</h1>
                    {description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
                </div>
                {action && <div className='shrink-0'>{action}</div>}
            </div>
        </div>
    )
}

export const SearchInput = ({ value, onChange, placeholder }) => {
    return (
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className='h-10 w-full rounded-full border bg-card px-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:w-72'
        />
    )
}

export const RowMenuItem = ({ icon: Icon, children, destructive, ...props }) => {
    return (
        <button
            type="button"
            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm ${destructive ? 'text-rose-600 hover:bg-rose-50' : 'hover:bg-secondary'}`}
            {...props}>
            <Icon className='h-4 w-4' /> {children}
        </button>
    )
}

export const TableSkeleton = () => (
    <div className='space-y-3 p-6'>
        {[1, 2, 3, 4].map((item) => <div key={item} className='h-12 w-full animate-pulse rounded-md bg-muted' />)}
    </div>
)

export default PageHeader
