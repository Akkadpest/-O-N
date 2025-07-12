import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import ClientWrapper from '@/components/client-wrapper'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'O&N Home Renovation - Premium Home Renovation Services in Dubai',
  description: 'Transform your Dubai home with O&N Home Renovation. Premium renovation services, luxury interior design, and construction expertise across Dubai.',
  keywords: 'home renovation Dubai, luxury renovation, kitchen renovation Dubai, bathroom renovation Dubai, interior design Dubai',
  openGraph: {
    title: 'O&N Home Renovation - Premium Home Renovation Services in Dubai',
    description: 'Transform your Dubai home with O&N Home Renovation. Premium renovation services, luxury interior design, and construction expertise across Dubai.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <ClientWrapper>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </ClientWrapper>
      </body>
    </html>
  )
}