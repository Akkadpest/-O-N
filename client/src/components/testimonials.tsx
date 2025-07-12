import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ahmed Al-Khalil",
      location: "Emirates Hills",
      initials: "AK",
      text: "O&N transformed our villa in Emirates Hills beyond our expectations. The attention to detail and use of premium materials made all the difference. Our home now feels like a luxury resort."
    },
    {
      name: "Sarah Johnson",
      location: "Dubai Marina",
      initials: "SJ",
      text: "Professional service from start to finish. The team was punctual, clean, and delivered exactly what was promised. Our kitchen renovation is absolutely stunning!"
    },
    {
      name: "Michael Roberts",
      location: "Jumeirah",
      initials: "MR",
      text: "Exceptional craftsmanship and design expertise. O&N helped us create a modern family home that perfectly balances luxury with comfort. Highly recommended!"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from satisfied clients across Dubai.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-warm-gray rounded-xl shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-dubai-gold text-xl">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.initials}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
