import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

// company logo with the company's initials as a fallback
const CompanyLogo = ({ company, className }) => {
    return (
        <Avatar className={cn('h-11 w-11 rounded-xl border bg-background', className)}>
            {company?.logo && <AvatarImage src={company.logo} alt={company?.name} className="object-cover" />}
            <AvatarFallback className="rounded-xl bg-secondary text-[0.8em] font-semibold text-secondary-foreground">{initials(company?.name)}</AvatarFallback>
        </Avatar>
    )
}

export default CompanyLogo
