import { Suspense } from 'react'
import { AuthForm } from '../AuthForm'
import { AuthHeading } from '../AuthHeading'

export const metadata = { title: 'Sign in' }

export default function LoginPage(): React.JSX.Element {
  return (
    <>
      <AuthHeading
        title='Welcome back'
        description='Sign in to continue to your EnrichMINT account.'
      />
      <Suspense>
        <AuthForm mode='login' />
      </Suspense>
    </>
  )
}
