
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      link: "https://www.youtube.com/@Alphadominity"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
                <p className="text-gray-600">
                  Have a question about our products or sustainability practices? We're here to help!
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        required 
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        required 
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required 
                      placeholder="How can we help you?" 
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <info.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-700 mb-1">{info.details}</p>
                      <p className="text-sm text-gray-500">{info.subtext}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📚 View FAQ
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📋 Track Your Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔄 Return Policy
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🌱 Sustainability Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Find quick answers to common questions about our products and services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  {faq.link && (
                    <a 
                      href={faq.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-red-600 hover:text-red-700 font-medium"
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

        {/* Map Section */}
        <section className="mt-20">
          <Card className="overflow-hidden">
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Visit us at our San Francisco location</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Contact;
