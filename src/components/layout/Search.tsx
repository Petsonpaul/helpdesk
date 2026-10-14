'use client'
import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { buildSidebar } from '@/lib/permissions'

/** Quick jump to any page in your own menu. */
function Search() {
  const [query, setQuery] = useState('')
  const { user } = useAuth()

  const results = useMemo(() => {
    if (!user || !query.trim()) return []
    return buildSidebar(user.role).flatMap((s) => s.children).filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, user])

  return (
    <div className='relative w-full'>
      <div className='flex items-center relative lg:w-xs mx-auto '>
        <Icon icon='solar:magnifer-linear' width='18' height='18' className='absolute left-3 top-1/2 -translate-y-1/2' />
        <label htmlFor='quick-nav' className='sr-only'>Go to page</label>
        <Input id='quick-nav' placeholder='Go to page...' className='rounded-xl pl-10' value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className={`absolute w-full  bg-background rounded-md top-11 z-10 start-0 shadow-md border border-border ${Boolean(query) ? 'block' : 'hidden'}`}>
        <SimpleBar className='max-h-72 p-4 custom-scroll'>
          {results.length > 0 ? (
            results.map((item) => (
              <Link key={item.id} href={item.url} onClick={() => setQuery('')}
                className='p-2 mb-1.5 last:mb-0 flex items-center bg-input/30 gap-2 text-sm font-medium rounded-md hover:bg-primary/20 hover:text-primary w-full'>
                <Icon icon={item.icon} width={18} height={18} />
                <span>{item.name}</span>
              </Link>
            ))
          ) : (
            <p className='py-4 text-center text-sm font-medium'>No pages found</p>
          )}
        </SimpleBar>
      </div>
    </div>
  )
}

export default Search
