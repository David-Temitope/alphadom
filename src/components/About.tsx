import { ShoppingCart, Truck, CreditCard, Award, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const About = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Wide Selection",
      description: "From electronics to fashion and daily essentials — shop a wide range of products from trusted sellers."
    },
    {
      icon: Award,
      title: "Verified Sellers",
      description: "Every seller is verified to ensure quality, reliability, and peace of mind."
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Protected payments and buyer safeguards for safe, worry-free transactions."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery options to your preferred location."
    }
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-card">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Built for Everyone
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you're buying essentials, discovering great deals, or growing your online business,
            Alphadom connects buyers with verified vendors in one secure marketplace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-primary/20 group"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
