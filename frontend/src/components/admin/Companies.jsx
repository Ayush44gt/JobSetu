import { useState } from 'react'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
import PageHeader, { SearchInput } from './PageHeader'

const Companies = () => {
    const { data, setData, loading, error, refetch } = useFetch("/company/get");
    const [input, setInput] = useState("");

    return (
        <div className='page py-8'>
            <PageHeader
                title="Companies"
                description="Companies you have registered. Jobs are posted under a company."
                action={<Button asChild><Link to="/admin/companies/create"><Plus className='mr-2 h-4 w-4' /> New company</Link></Button>}
            />
            <div className='mt-6'>
                <SearchInput value={input} onChange={setInput} placeholder="Filter by name" />
            </div>
            <div className='surface mt-4 overflow-hidden'>
                <CompaniesTable
                    companies={data?.companies}
                    search={input}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                    onDeleted={(id) => setData({ ...data, companies: data.companies.filter((company) => company._id !== id) })}
                />
            </div>
        </div>
    )
}

export default Companies
