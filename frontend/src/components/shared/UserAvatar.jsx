import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

// profile photo with the person's initials as a fallback
const UserAvatar = ({ user, className }) => {
    return (
        <Avatar className={cn('border bg-background', className)}>
            {user?.profile?.profilePhoto && <AvatarImage src={user.profile.profilePhoto} alt={user?.fullname} className="object-cover" />}
            <AvatarFallback className="bg-accent text-accent-foreground text-[0.8em] font-semibold">{initials(user?.fullname)}</AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar
