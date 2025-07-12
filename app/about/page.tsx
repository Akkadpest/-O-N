import Navigation from '@/components/navigation'
import About from '@/components/about/about'
import Footer from '@/components/footer'
import BackToTop from '@/components/back-to-top'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - O&N Home Renovation Dubai',
  description: 'Learn about O&N Home Renovation Dubai - your trusted partner for luxury home renovations with over 15 years of experience serving Dubai residents.',
  keywords: 'O&N Home Renovation Dubai, about us, home renovation company Dubai, luxury renovations Dubai, renovation experts',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <About />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}