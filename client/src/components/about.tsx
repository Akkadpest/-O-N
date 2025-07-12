import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Tag } from "lucide-react";

export default function About() {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6">
              About O&N Home Renovation
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              With over 15 years of experience in Dubai's luxury home renovation market, O&N Home Renovation has established itself as the premier choice for discerning homeowners who demand excellence.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our team of skilled craftsmen and designers understand the unique aesthetic preferences and quality standards that define Dubai's luxury residential market. We combine international design trends with local expertise to create spaces that are both beautiful and functional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-2">Our Mission</h3>
                <p className="text-gray-600">To transform Dubai homes into personalized sanctuaries that reflect our clients' unique style and lifestyle needs.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-2">Our Vision</h3>
                <p className="text-gray-600">To be Dubai's most trusted name in luxury home renovation, setting new standards for quality and innovation.</p>
              </div>
            </div>
            <Button 
              onClick={scrollToContact}
              className="bg-dubai-gold hover:bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Your Project
            </Button>
          </div>
          
          <div className="space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="O&N Team Working on Renovation" 
              className="rounded-xl shadow-lg w-full"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white rounded-lg shadow-md">
                <CardContent className="p-6 text-center">
                  <Award className="text-dubai-gold text-3xl mb-3 h-8 w-8 mx-auto" />
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-lg shadow-md">
                <CardContent className="p-6 text-center">
                  <Users className="text-dubai-gold text-3xl mb-3 h-8 w-8 mx-auto" />
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Expert Team</div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-lg shadow-md">
                <CardContent className="p-6 text-center">
                  <Tag className="text-dubai-gold text-3xl mb-3 h-8 w-8 mx-auto" />
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-gray-600">Licensed</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
