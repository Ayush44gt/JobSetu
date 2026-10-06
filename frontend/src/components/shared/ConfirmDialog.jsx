import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'

const ConfirmDialog = ({ open, onOpenChange, title, description, confirmLabel = "Delete", loading, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="pt-1">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:space-x-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmDialog
