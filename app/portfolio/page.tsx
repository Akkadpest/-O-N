import Navigation from '@/components/navigation'
import Portfolio from '@/components/portfolio/portfolio'
import Footer from '@/components/footer'
import BackToTop from '@/components/back-to-top'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Portfolio - O&N Home Renovation Dubai',
  description: 'Explore our stunning portfolio of completed home renovation projects across Dubai including luxury villas, apartments, and commercial spaces.',
  keywords: 'Dubai renovation portfolio, luxury home projects Dubai, renovation gallery Dubai, before after renovations',
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Portfolio />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}