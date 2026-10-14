import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <PublicNav />
      <main className='flex-1'>{children}</main>
      <PublicFooter />
    </div>
  )
}
