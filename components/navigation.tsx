'use client'

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import logoImage from "@/attached_assets/ChatGPT Image Jul 12, 2025, 10_28_30 AM_1752306324523.png"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-40 h-16">
                <Image 
                  src={logoImage}
                  alt="O&N Home Renovation Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                href="/"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/services"
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Services
              </Link>
              <Link 
                href="/portfolio"
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Portfolio
              </Link>
              <Link 
                href="/about"
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                About
              </Link>
              <Link 
                href="/contact"
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Link href="/contact">
              <Button 
                className="bg-dubai-gold hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Quote
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              onClick={closeMenu}
              className="block w-full text-left px-3 py-2 text-primary hover:text-primary-dark font-medium"
            >
              Home
            </Link>
            <Link 
              href="/services"
              onClick={closeMenu}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Services
            </Link>
            <Link 
              href="/portfolio"
              onClick={closeMenu}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Portfolio
            </Link>
            <Link 
              href="/about"
              onClick={closeMenu}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact"
              onClick={closeMenu}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Contact
            </Link>
            <div className="px-3 py-2">
              <Link href="/contact" onClick={closeMenu}>
                <Button 
                  className="w-full bg-dubai-gold hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}