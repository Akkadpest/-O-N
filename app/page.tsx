import Navigation from '@/components/navigation'
import Hero from '@/components/hero'
import Services from '@/components/services/services'
import Portfolio from '@/components/portfolio/portfolio'
import About from '@/components/about/about'
import Testimonials from '@/components/testimonials'
import Contact from '@/components/contact/contact'
import Footer from '@/components/footer'
import BackToTop from '@/components/back-to-top'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Testimonials />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  )
}