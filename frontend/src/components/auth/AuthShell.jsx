import { GraduationCap, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// shared card for the login and signup pages
export const AuthShell = ({ title, subtitle, children, footer }) => {
    return (
        <div className='page flex justify-center py-10 sm:py-16'>
            <div className='w-full max-w-md'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold sm:text-3xl'>{title}</h1>
                    <p className='mt-2 text-sm text-muted-foreground'>{subtitle}</p>
                </div>
                <div className='surface mt-8 p-6 sm:p-8'>{children}</div>
                <p className='mt-6 text-center text-sm text-muted-foreground'>{footer}</p>
            </div>
        </div>
    )
}

const roles = [
    { value: "student", label: "Student", hint: "Find and apply to jobs", icon: GraduationCap },
    { value: "recruiter", label: "Recruiter", hint: "Post jobs and hire", icon: Building2 },
]

export const RolePicker = ({ value, onChange }) => {
    return (
        <div role="radiogroup" aria-label="Account type" className='grid grid-cols-2 gap-3'>
            {
                roles.map((role) => (
                    <button
                        key={role.value}
                        type="button"
                        role="radio"
                        aria-checked={value === role.value}
                        onClick={() => onChange(role.value)}
                        className={cn(
                            'rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            value === role.value ? 'border-primary bg-accent ring-1 ring-primary' : 'hover:border-primary/40'
                        )}>
                        <role.icon className={cn('h-5 w-5', value === role.value ? 'text-primary' : 'text-muted-foreground')} />
                        <span className='mt-2 block text-sm font-semibold'>{role.label}</span>
                        <span className='block text-xs text-muted-foreground'>{role.hint}</span>
                    </button>
                ))
            }
        </div>
    )
}
