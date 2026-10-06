import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export const EmptyState = ({ icon: Icon, title, description, action, className }) => {
    return (
        <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center', className)}>
            {Icon && (
                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground'>
                    <Icon className='h-5 w-5' />
                </div>
            )}
            <h3 className='text-base font-semibold'>{title}</h3>
            {description && <p className='mt-1 max-w-sm text-sm text-muted-foreground'>{description}</p>}
            {action && <div className='mt-5'>{action}</div>}
        </div>
    )
}

export const ErrorState = ({ message, onRetry, className }) => {
    return (
        <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 px-6 py-12 text-center', className)}>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600'>
                <AlertTriangle className='h-5 w-5' />
            </div>
            <h3 className='text-base font-semibold'>Could not load this</h3>
            <p className='mt-1 max-w-sm text-sm text-muted-foreground'>{message}</p>
            {onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}>Try again</Button>}
        </div>
    )
}

export const PageLoader = () => {
    return (
        <div className='flex min-h-[60vh] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </div>
    )
}

// submit button that shows a spinner while its form is saving
export const SubmitButton = ({ loading, children, className, ...props }) => {
    return (
        <Button type="submit" disabled={loading} className={className} {...props}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? 'Please wait' : children}
        </Button>
    )
}
