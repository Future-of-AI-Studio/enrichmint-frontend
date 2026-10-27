import './globals.css'
import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Bricolage_Grotesque, Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage'
})

export const metadata: Metadata = {
  title: { default: 'EnrichMINT', template: '%s · EnrichMINT' },
  description:
    'EnrichMINT helps people earn from their real-life experience, while helping others learn from it.'
}

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  // Reading headers makes every route dynamic, so each response gets a fresh CSP nonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang='en' className={`${inter.variable} ${bricolage.variable}`}>
      <head nonce={nonce} suppressHydrationWarning />
      <body className='min-h-screen font-sans antialiased'>
        <Toaster
          closeButton
          position='top-right'
          toastOptions={{ className: 'font-sans text-sm' }}
        />
        {children}
      </body>
    </html>
  )
}
