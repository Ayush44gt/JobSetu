import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react'
import FilterCard from './FilterCard'
import { salaryBands } from '@/lib/filters'
import { JobGrid } from './Job'
import { EmptyState } from './shared/States'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import useFetch from '@/hooks/useFetch'

const filterKeys = ["location", "type", "salary", "exp"];

const Jobs = () => {
    // every filter lives in the url, so a search can be shared or refreshed
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "latest";
    const filters = Object.fromEntries(filterKeys.map((key) => [key, searchParams.get(key) || ""]));
    const activeCount = filterKeys.filter((key) => filters[key]).length;

    const [input, setInput] = useState(q);
    const [showFilters, setShowFilters] = useState(false);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        setSearchParams(next, { replace: true });
    }

    // keep the box in sync when the url changes from outside (navbar, home page chips)
    useEffect(() => { setInput(q); }, [q]);

    // search as the user types, after a short pause
    useEffect(() => {
        if (input.trim() === q) return;
        const timer = setTimeout(() => setParam("q", input.trim()), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input]);

    const band = salaryBands.find((item) => item.value === filters.salary);
    const { data, loading, error, refetch } = useFetch("/job/get", {
        keyword: q || undefined,
        location: filters.location || undefined,
        jobType: filters.type || undefined,
        salaryMin: band?.min || undefined,
        salaryMax: band?.max,
        experienceMax: filters.exp || undefined,
        sort: sort === "salary" ? "salary" : undefined,
    });
    const { data: meta } = useFetch("/job/meta");

    const clearAll = () => {
        setInput("");
        setSearchParams({}, { replace: true });
    }

    const filterCard = (
        <FilterCard
            filters={filters}
            onChange={setParam}
            onClear={() => {
                const next = new URLSearchParams(searchParams);
                filterKeys.forEach((key) => next.delete(key));
                setSearchParams(next, { replace: true });
            }}
            locations={meta?.locations}
            jobTypes={meta?.jobTypes}
            activeCount={activeCount}
        />
    );

    return (
        <div className='page py-8'>
            <div>
                <h1 className='text-2xl font-bold sm:text-3xl'>Find your next role</h1>
                <p className='mt-1 text-sm text-muted-foreground'>Search by title, skill, company or location.</p>
            </div>

            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                <div className='relative flex-1'>
                    <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='Search jobs'
                        aria-label="Search jobs"
                        className='h-11 w-full rounded-full border bg-card pl-11 pr-10 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
                    />
                    {
                        input && (
                            <button onClick={() => { setInput(""); setParam("q", ""); }} aria-label="Clear search" className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary'>
                                <X className='h-4 w-4' />
                            </button>
                        )
                    }
                </div>
                <div className='flex gap-3'>
                    <Select value={sort} onValueChange={(value) => setParam("sort", value === "latest" ? "" : value)}>
                        <SelectTrigger className="h-11 w-full rounded-full bg-card px-4 sm:w-44" aria-label="Sort jobs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Newest first</SelectItem>
                            <SelectItem value="salary">Highest salary</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-11 shrink-0 rounded-full lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal className='mr-2 h-4 w-4' /> Filters{activeCount > 0 && ` (${activeCount})`}
                    </Button>
                </div>
            </div>

            <div className='mt-6 flex flex-col gap-6 lg:flex-row'>
                <aside className='hidden w-64 shrink-0 lg:block'>
                    <div className='sticky top-24'>{filterCard}</div>
                </aside>
                {showFilters && <div className='lg:hidden'>{filterCard}</div>}

                <div className='min-w-0 flex-1'>
                    <p className='mb-4 text-sm text-muted-foreground' aria-live="polite">
                        {loading ? "Searching…" : error ? "" : `${data?.jobs?.length || 0} ${data?.jobs?.length === 1 ? "job" : "jobs"} found${q ? ` for “${q}”` : ""}`}
                    </p>
                    <JobGrid
                        jobs={data?.jobs}
                        loading={loading}
                        error={error}
                        onRetry={refetch}
                        columns="sm:grid-cols-2 xl:grid-cols-3"
                        empty={
                            <EmptyState
                                icon={SearchX}
                                title="No jobs match your search"
                                description="Try a different keyword or remove some filters."
                                action={(q || activeCount > 0) && <Button variant="outline" onClick={clearAll}>Clear search and filters</Button>}
                            />
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default Jobs
