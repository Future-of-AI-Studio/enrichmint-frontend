import { Suspense } from 'react'
import { AuthForm } from '../AuthForm'
import { AuthHeading } from '../AuthHeading'

export const metadata = { title: 'Join' }

export default function SignUpPage(): React.JSX.Element {
  return (
    <>
      <AuthHeading
        title='Create your account'
        description='One account lets you both learn from others and share your own experience.'
      />
      <Suspense>
        <AuthForm mode='signup' />
      </Suspense>
    </>
  )
}
