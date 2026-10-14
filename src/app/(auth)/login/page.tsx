import { Suspense } from 'react'
import { Login } from '@/components/auth/Login'
import DemoLogin from '@/components/demo/DemoLogin'
import { DEMO_MODE } from '@/lib/demo'

export const metadata = { title: 'Login - Qelvoro' }
export default function Page() {
  return DEMO_MODE ? <DemoLogin /> : <Suspense><Login /></Suspense>
}
