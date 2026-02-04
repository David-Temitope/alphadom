import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNewsletter } from "@/hooks/useNewsletter";
import { ShoppingCart } from "lucide-react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const { subscribe, loading } = useNewsletter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const result = await subscribe(email);
    if (result.success) {
      setEmail("");
    }
  };

  return (
    <footer className="bg-[hsl(220,20%,14%)] text-[hsl(220,14%,70%)]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">Alphadom</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted online marketplace. We connect buyers to verified vendors for quality products at great prices.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[hsl(220,14%,70%)] hover:text-white transition-colors"
                onClick={() => window.open("https://www.facebook.com/share/16WJUWkNS6/", "_blank", "noopener,noreferrer")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[hsl(220,14%,70%)] hover:text-white transition-colors"
                onClick={() => window.open("https://www.instagram.com/alphadominity", "_blank", "noopener,noreferrer")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[hsl(220,14%,70%)] hover:text-white transition-colors"
                onClick={() => window.open("https://whatsapp.com/channel/0029VbBMmq2G8l5Nl5k5r201", "_blank", "noopener,noreferrer")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Legal & Policies</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/delivery-policy" className="hover:text-white transition-colors">
                  Delivery Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Stay Connected</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>alphadominity@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+234 810 5546 777</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Abuja, Nigeria</span>
              </div>
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
              <p className="text-sm">Subscribe for updates & offers</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-[hsl(220,14%,50%)] focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5"
                >
                  {loading ? "..." : "Join"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center sm:text-left">
            © 2025 Alphadom. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
