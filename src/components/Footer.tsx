
import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Pilot</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner in sustainable living. We curate the finest eco-friendly products 
              to help you make environmentally conscious choices.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=home" className="text-gray-300 hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=personal" className="text-gray-300 hover:text-white transition-colors">Personal Care</Link></li>
              <li><Link to="/products?category=food" className="text-gray-300 hover:text-white transition-colors">Food & Beverage</Link></li>
              <li><Link to="/products?category=fashion" className="text-gray-300 hover:text-white transition-colors">Fashion</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">pilots@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">+234 810 5546 777</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Abuja, Nigeria</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Subscribe for eco-tips & updates</p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Pilot. All rights reserved. | Made with 💚 for a sustainable future.
          </p>
        </div>
      </div>
    </footer>
  );
};
