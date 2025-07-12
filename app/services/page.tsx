import Navigation from '@/components/navigation'
import Services from '@/components/services/services'
import Footer from '@/components/footer'
import BackToTop from '@/components/back-to-top'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Services - O&N Home Renovation Dubai',
  description: 'Comprehensive renovation services in Dubai including kitchen renovation, bathroom renovation, living spaces, bedrooms, and complete home transformations.',
  keywords: 'Dubai renovation services, kitchen renovation Dubai, bathroom renovation Dubai, home renovation services',
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Services />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}