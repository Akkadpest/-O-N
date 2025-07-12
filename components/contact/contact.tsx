'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters")
})

type ContactFormData = z.infer<typeof contactSchema>

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: ""
    }
  })

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for your inquiry! We will contact you soon.",
        duration: 5000,
      })
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending your message. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    await contactMutation.mutateAsync(data)
    setIsSubmitting(false)
  }

  const serviceAreas = [
    "Dubai Marina",
    "Downtown Dubai",
    "Emirates Hills",
    "Jumeirah",
    "Business Bay",
    "DIFC",
    "Palm Jumeirah",
    "Arabian Ranches"
  ]

  return (
    <section id="contact" className="py-24 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold mb-4">
            Start Your Dream Renovation
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Ready to transform your Dubai home? Contact us for a free consultation and quote.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <MapPin className="text-dubai-gold text-2xl mr-4 h-6 w-6" />
                <div>
                  <div className="font-semibold">Office Location</div>
                  <div className="text-gray-200">Business Bay, Dubai, UAE</div>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="text-dubai-gold text-2xl mr-4 h-6 w-6" />
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-200">+971 50 123 4567</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-dubai-gold text-2xl mr-4 h-6 w-6" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-200">info@onhomerenovation.ae</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="text-dubai-gold text-2xl mr-4 h-6 w-6" />
                <div>
                  <div className="font-semibold">Business Hours</div>
                  <div className="text-gray-200">Sun-Thu: 8:00 AM - 6:00 PM</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Service Areas</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-200">
                {serviceAreas.map((area, index) => (
                  <div key={index}>• {area}</div>
                ))}
              </div>
            </div>
          </div>
          
          <Card className="bg-white rounded-xl text-gray-900">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6 text-primary">Request a Quote</h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      placeholder="+971 50 123 4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </Label>
                    <Select onValueChange={(value) => form.setValue("service", value)}>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen">Kitchen Renovation</SelectItem>
                        <SelectItem value="bathroom">Bathroom Renovation</SelectItem>
                        <SelectItem value="living">Living Room Design</SelectItem>
                        <SelectItem value="bedroom">Bedroom Design</SelectItem>
                        <SelectItem value="office">Home Office</SelectItem>
                        <SelectItem value="complete">Complete Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.service && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.service.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details
                  </Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {form.formState.errors.message && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  {isSubmitting ? "Sending..." : "Get Free Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}