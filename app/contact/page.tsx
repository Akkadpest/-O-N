import Navigation from '@/components/navigation'
import Contact from '@/components/contact/contact'
import Footer from '@/components/footer'
import BackToTop from '@/components/back-to-top'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - O&N Home Renovation Dubai',
  description: 'Get in touch with O&N Home Renovation Dubai for your renovation project. Free consultation and quotes available. Call us or fill out our contact form.',
  keywords: 'contact O&N Dubai, renovation consultation Dubai, free renovation quote Dubai, home renovation contact',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}