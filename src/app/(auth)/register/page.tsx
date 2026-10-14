import { Suspense } from 'react'
import { Register } from '@/components/auth/Register'
import DemoLogin from '@/components/demo/DemoLogin'
import { DEMO_MODE } from '@/lib/demo'

export const metadata = { title: 'Register - Qelvoro' }
export default function Page() {
  return DEMO_MODE ? <DemoLogin /> : <Suspense><Register /></Suspense>
}
