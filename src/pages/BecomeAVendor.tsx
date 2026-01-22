import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShopApplicationForm } from '@/components/ShopApplicationForm';
import {
  Store,
  TrendingUp,
  Shield,
  CreditCard,
  Users,
  Package,
  CheckCircle,
  ArrowRight,
  Star,
  Truck,
  HeadphonesIcon,
  BarChart3,
} from 'lucide-react';

const BecomeAVendor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleStartSelling = () => {
    if (!user) {
      navigate('/auth?redirect=/become-a-vendor');
      return;
    }
    setShowApplicationForm(true);
  };

  const benefits = [
    {
      icon: Store,
      title: 'Your Own Storefront',
      description: 'Create a personalized store page with your brand, logo, and product catalog.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Reach thousands of customers actively looking to buy quality products.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Get paid directly to your bank account with our secure payment system.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your sales, orders, and customer insights in real-time.',
    },
    {
      icon: Truck,
      title: 'Flexible Delivery',
      description: 'Choose to handle deliveries yourself or use our dispatch network.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Dedicated Support',
      description: '24/7 vendor support to help you succeed on our platform.',
    },
  ];

  const steps = [
    {
      step: 1,
      title: 'Complete Application',
      description: 'Fill out a simple form with your business details and verification documents.',
    },
    {
      step: 2,
      title: 'Get Approved',
      description: 'Our team reviews your application within 24-48 hours.',
    },
    {
      step: 3,
      title: 'Set Up Store',
      description: 'Customize your storefront and add your products.',
    },
    {
      step: 4,
      title: 'Start Selling',
      description: 'Go live and start receiving orders from customers!',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '₦0',
      period: '/month',
      features: [
        'Up to 20 products',
        'Basic analytics',
        'Standard support',
        '15% commission per sale',
      ],
      popular: false,
    },
    {
      name: 'Economy',
      price: '₦5,000',
      period: '/month',
      features: [
        'Up to 100 products',
        'Advanced analytics',
        'Priority support',
        '10% commission per sale',
        'Verified badge',
      ],
      popular: true,
    },
    {
      name: 'First Class',
      price: '₦15,000',
      period: '/month',
      features: [
        'Unlimited products',
        'Premium analytics',
        '24/7 dedicated support',
        '5% commission per sale',
        'Premium badge',
        'Homepage visibility',
        'Free promotional ads',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Store className="w-3 h-3 mr-1" />
              Become a Vendor
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Start Selling on <span className="text-primary">Alphadom</span> Today
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful vendors and reach customers across Nigeria. 
              No setup fees, no hidden charges - just a simple commission on sales.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={handleStartSelling} className="gap-2">
                Start Selling
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pilots">View Top Vendors</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>1,000+ Active Vendors</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>50,000+ Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>4.8/5 Vendor Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Why Sell on Alphadom?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to launch and grow your online business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as your business grows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105'
                    : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={handleStartSelling}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              What You'll Need to Apply
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Valid Nigerian phone number',
                'Bank account for payments',
                'Government-issued ID',
                'Business description',
                'Product category information',
                'Store name and logo (optional)',
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Business?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Alphadom today and start reaching thousands of customers. 
              No upfront costs, no long-term contracts.
            </p>
            <Button size="lg" onClick={handleStartSelling} className="gap-2">
              Register as a Vendor
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      <ShopApplicationForm 
        open={showApplicationForm} 
        onOpenChange={setShowApplicationForm} 
      />
    </div>
  );
};

export default BecomeAVendor;
