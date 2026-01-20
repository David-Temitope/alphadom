import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Loader2, ExternalLink, Package } from "lucide-react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Contact = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "alphadominity@gmail.com",
      subtext: "We respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+234 8105 546 777",
      subtext: "Mon-Fri, 9AM-6PM PST"
    },
    {
      icon: MapPin,
      title: "Where Are We?",
      details: "Serving customers globally from Abuja, Nigeria",
      subtext: "By appointment only"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Fri: 9AM-6PM PST",
      subtext: "Sat-Sun: 10AM-4PM PST"
    }
  ];

  const faqs = [
    {
      question: "How do I start selling on this platform?",
      answer: "To start selling on this platform you need to first create a vendor account from the User Type page, wait for approval and then pay for online store."
    },
    {
      question: "Is it safe to buy from sellers here?",
      answer: "Yes. Every vendor is verified before they can sell and customers are secured with our 7 days return policy. In case you have a issue with one of our vendors, please do well by reporting through our email."
    },
    {
      question: "Do I need to have a registered business before joining?",
      answer: "Not necessarily. This platform is created for people who just started their business and looking for online awareness. However, having proper registeration helps build customers trust."
    },
    {
      question: "What fee or commissions does the platform charge?",
      answer: "We charge rental fee to users who wants to be vendor, and also small commission on every sale to help maintain the platform and provide secure service."
    },
    {
      question: "How To...",
      answer: "Check out our YouTube channel for tutorials and guides on how to use the platform effectively.",
      link: "https://youtube.com/@alphadominity?si=RjHCMVnXgyvL5q7W"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-border/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-card border-b border-border/50">
                <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Have a question about our products or services? We're here to help!
                </p>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        required 
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="rounded-xl border-border/50"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        required 
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="rounded-xl border-border/50"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-xl border-border/50"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required 
                      placeholder="How can we help you?" 
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="rounded-xl border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="rounded-xl border-border/50 resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow border-border/50 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                      <p className="text-foreground mb-1">{info.details}</p>
                      <p className="text-sm text-muted-foreground">{info.subtext}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Links */}
            <Card className="border-border/50 rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-5">
                <Link to="/orders">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border/50 hover:bg-primary/5">
                    <Package className="w-4 h-4 mr-2" />
                    Track Your Order
                  </Button>
                </Link>
                <Link to="/return-policy">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border/50 hover:bg-primary/5">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Return Policy
                  </Button>
                </Link>
                <Link to="/delivery-policy">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border/50 hover:bg-primary/5">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Delivery Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 md:mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Find quick answers to common questions about our products and services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow border-border/50 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  {faq.link && (
                    <a 
                      href={faq.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-destructive hover:text-destructive/80 font-medium transition-colors"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
