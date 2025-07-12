'use client'

import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react"

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="text-dubai-gold font-bold text-2xl">O&N</div>
              <div className="ml-2 text-gray-400 text-sm font-medium">HOME RENOVATION</div>
            </div>
            <p className="text-gray-400 mb-4">
              Transform your Dubai home with premium renovation services that exceed expectations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-dubai-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-dubai-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-dubai-gold transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection("services")} className="hover:text-dubai-gold transition-colors">Kitchen Renovation</button></li>
              <li><button onClick={() => scrollToSection("services")} className="hover:text-dubai-gold transition-colors">Bathroom Renovation</button></li>
              <li><button onClick={() => scrollToSection("services")} className="hover:text-dubai-gold transition-colors">Living Room Design</button></li>
              <li><button onClick={() => scrollToSection("services")} className="hover:text-dubai-gold transition-colors">Bedroom Design</button></li>
              <li><button onClick={() => scrollToSection("services")} className="hover:text-dubai-gold transition-colors">Complete Renovation</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection("about")} className="hover:text-dubai-gold transition-colors">About Us</button></li>
              <li><button onClick={() => scrollToSection("portfolio")} className="hover:text-dubai-gold transition-colors">Portfolio</button></li>
              <li><button onClick={() => scrollToSection("contact")} className="hover:text-dubai-gold transition-colors">Contact</button></li>
              <li><a href="#" className="hover:text-dubai-gold transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-dubai-gold transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Business Bay, Dubai</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+971 50 123 4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@onhomerenovation.ae</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 O&N Home Renovation. All rights reserved. | Licensed & Insured in Dubai, UAE</p>
        </div>
      </div>
    </footer>
  )
}