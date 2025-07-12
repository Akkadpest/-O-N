import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-primary font-bold text-2xl">O&N</div>
              <div className="ml-2 text-gray-600 text-sm font-medium">HOME RENOVATION</div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection("portfolio")}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Portfolio
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Button 
              onClick={() => scrollToSection("contact")}
              className="bg-dubai-gold hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get Quote
            </Button>
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
            <button 
              onClick={() => scrollToSection("home")}
              className="block w-full text-left px-3 py-2 text-primary hover:text-primary-dark font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("services")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection("portfolio")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Portfolio
            </button>
            <button 
              onClick={() => scrollToSection("about")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium"
            >
              Contact
            </button>
            <div className="px-3 py-2">
              <Button 
                onClick={() => scrollToSection("contact")}
                className="w-full bg-dubai-gold hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
