import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../ui/button'
import { EmptyState } from './States'

const NotFound = () => {
    return (
        <div className='page py-20'>
            <EmptyState
                icon={Compass}
                title="Page not found"
                description="The page you are looking for does not exist or has been moved."
                action={<Button asChild><Link to="/">Back to home</Link></Button>}
            />
        </div>
    )
}

export default NotFound
