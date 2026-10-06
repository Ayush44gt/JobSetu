import { Label } from './ui/label'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { experienceOptions, salaryBands } from '@/lib/filters'

const Option = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition',
            active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}>
        <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', active ? 'border-primary' : 'border-input')}>
            {active && <span className='h-2 w-2 rounded-full bg-primary' />}
        </span>
        {children}
    </button>
)

// `filters` holds the current values; `onChange(key, value)` sets one of them ("" clears it)
const FilterCard = ({ filters, onChange, onClear, locations = [], jobTypes = [], activeCount }) => {
    const toggle = (key, value) => onChange(key, filters[key] === value ? "" : value);

    const groups = [
        { key: "location", title: "Location", options: locations.map((location) => ({ value: location, label: location })) },
        { key: "type", title: "Job type", options: jobTypes.map((type) => ({ value: type, label: type })) },
        { key: "salary", title: "Salary", options: salaryBands },
        { key: "exp", title: "Experience", options: experienceOptions },
    ];

    return (
        <div className='surface p-4'>
            <div className='flex items-center justify-between px-2'>
                <h2 className='font-semibold'>Filters</h2>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={!activeCount} onClick={onClear}>Clear all</Button>
            </div>
            {
                groups.map((group) => (
                    <div key={group.key} className='mt-4'>
                        <Label className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</Label>
                        <div className='mt-1.5 space-y-0.5'>
                            {
                                group.options.map((option) => (
                                    <Option key={option.value} active={filters[group.key] === option.value} onClick={() => toggle(group.key, option.value)}>
                                        {option.label}
                                    </Option>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default FilterCard
