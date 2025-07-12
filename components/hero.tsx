'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function Hero() {

  return (
    <section id="home" className="relative bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080"
          alt="Dubai luxury home renovation"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-playfair font-bold mb-6 leading-tight">
            Transform Your
            <span className="text-dubai-gold"> Dubai Home</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Premium home renovation services that bring your vision to life. From luxury interiors to complete home transformations across Dubai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portfolio">
              <Button 
                className="bg-dubai-gold hover:bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors w-full sm:w-auto"
              >
                View Our Work
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors w-full sm:w-auto"
              >
                Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating stats */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white rounded-xl shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Projects Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}