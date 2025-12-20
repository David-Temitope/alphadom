import { ShoppingCart, Truck, Shield, Award } from "lucide-react";

export const About = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Wide Selection",
      description: "From tech gadgets to sustainable products and everything in between"
    },
    {
      icon: Shield,
      title: "Verified Vendors",
      description: "All sellers are verified to ensure trust and reliability"
    },
    {
      icon: Truck,
      title: "Secure Shopping",
      description: "Safe and secure payment processing with buyer protection"
    },
    {
      icon: Award,
      title: "Curated Listings",
      description: "Carefully selected products from trusted sellers"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 px-2 sm:px-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md sm:max-w-2xl mx-auto leading-relaxed">
            We're your one-stop destination for everything from cutting-edge technology to eco-friendly alternatives. Quality, variety, and customer satisfaction are at the heart of everything we do.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
